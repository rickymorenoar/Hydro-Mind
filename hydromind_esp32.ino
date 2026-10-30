#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

const char* WIFI_SSID     = "Hpras199";       
const char* WIFI_PASSWORD = "gohma8888";  

const char* SERVER_BASE_URL = "http://192.168.1.6:8000/api";
const char* DEVICE_NAME     = "GreenHouse 1";

String apiKey = "W0FBoMLyvpzj9DdEk2M5dR5yZBFh79JEn0bZcXH7";

#define PIN_SOIL_ANALOG    34   // Input Analog Soil Moisture (Sensor 1)
#define PIN_WATERFLOW      32   // Input Pulsa Waterflow (Sensor 2)
#define PIN_DHT            14   // Input Data Sensor DHT22 (Sensor 3)
#define PIN_PUMP_RELAY     23   // Output Kontrol Relay Pompa (Pin 23)

#define DHTTYPE DHT22
DHT dht(PIN_DHT, DHTTYPE);

// ── 4. Kalibrasi Sensor Kelembapan Tanah ─────────────────────────────────────
const int SOIL_ADC_DRY = 4000;  // Nilai saat kering di udara terbuka (0%)
const int SOIL_ADC_WET = 1600;  // Nilai saat tercelup air / basah (100%)

const float FLOW_CALIBRATION_FACTOR = 7.5;

volatile unsigned long pulseCount = 0;
float waterFlowRate = 0.0;

String systemMode    = "AUTO";
String prevMode      = "";       // Mode sebelumnya, untuk deteksi perpindahan mode
String pumpManualCmd = "OFF";
float moistureLower  = 40.0;
float moistureUpper  = 70.0;

bool isPumpActive = false;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // Kirim data setiap 3 detik

void IRAM_ATTR pulseCounterISR() {
  pulseCount++;
}

void setPumpState(bool turnOn) {
  isPumpActive = turnOn;
  if (turnOn) {
    pinMode(PIN_PUMP_RELAY, OUTPUT);
    digitalWrite(PIN_PUMP_RELAY, LOW);   // ON (Tarik ke GND)
  } else {
    pinMode(PIN_PUMP_RELAY, INPUT);      // OFF (Dilepas / Floating)
  }
}

float readSoilMoisture() {
  long sum = 0;
  for (int i = 0; i < 15; i++) {
    sum += analogRead(PIN_SOIL_ANALOG);
    delay(5);
  }
  int adcValue = sum / 15;

  float percentage = (float)(SOIL_ADC_DRY - adcValue) / (float)(SOIL_ADC_DRY - SOIL_ADC_WET) * 100.0;
  percentage = constrain(percentage, 0.0, 100.0);

  Serial.printf("[SENSOR] Soil ADC: %d -> Kelembapan: %.1f%%\n", adcValue, percentage);
  return percentage;
}

float calculateWaterFlow(unsigned long durationMs) {
  detachInterrupt(digitalPinToInterrupt(PIN_WATERFLOW));
  unsigned long currentPulses = pulseCount;
  pulseCount = 0;
  attachInterrupt(digitalPinToInterrupt(PIN_WATERFLOW), pulseCounterISR, RISING);

  float pulsesPerSec = (float)currentPulses / (durationMs / 1000.0);
  float flowRate = pulsesPerSec / FLOW_CALIBRATION_FACTOR;

  if (!isPumpActive || flowRate < 0.1) {
    flowRate = 0.0;
  }

  Serial.printf("[SENSOR] Waterflow Pulsa: %lu -> Debit: %.2f L/m\n", currentPulses, flowRate);
  return flowRate;
}

void fetchServerCommand() {
  if (WiFi.status() != WL_CONNECTED || apiKey.length() == 0) return;

  HTTPClient http;
  String cmdUrl = String(SERVER_BASE_URL) + "/device/command";
  http.begin(cmdUrl);
  http.addHeader("X-API-KEY", apiKey);
  http.addHeader("Accept", "application/json");

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<300> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      systemMode     = doc["mode"].as<String>();
      pumpManualCmd  = doc["pump_cmd"].as<String>();
      moistureLower  = doc["moisture_lower"] | 40.0;
      moistureUpper  = doc["moisture_upper"] | 70.0;

      Serial.printf("[SERVER CMD] Mode: %s | PumpCmd: %s | Ambang: %.0f%% - %.0f%%\n",
                    systemMode.c_str(), pumpManualCmd.c_str(), moistureLower, moistureUpper);
    }
  } else {
    Serial.printf("[ERROR] Gagal mengambil command. HTTP: %d\n", httpCode);
  }
  http.end();
}

void postTelemetryData(float moisture, float flowRate, bool pumpState) {
  if (WiFi.status() != WL_CONNECTED || apiKey.length() == 0) return;

  HTTPClient http;
  String dataUrl = String(SERVER_BASE_URL) + "/device/data";
  http.begin(dataUrl);
  http.addHeader("X-API-KEY", apiKey);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");

  // ── Baca Sensor Fisik DHT22 (Suhu & Kelembapan Udara) ─────────────────────
  float airTemp = dht.readTemperature();
  float airHumidity = dht.readHumidity();

  if (isnan(airTemp) || isnan(airHumidity)) {
    Serial.println("[DHT22] ⚠️ Sensor DHT22 belum terhubung atau gagal membaca (cek kabel pin D14).");
    airTemp = 28.0;
    airHumidity = 65.0;
  } else {
    Serial.printf("[SENSOR] DHT22 -> Suhu: %.1f°C | Kelembapan Udara: %.1f%%\n", airTemp, airHumidity);
  }

  // Catu daya normal sistem (kompatibilitas database tanpa sensor INA)
  float batteryVoltage = 12.0;
  float batteryLevel   = 100.0;

  StaticJsonDocument<300> doc;
  doc["soil_moisture"]   = round(moisture * 10.0) / 10.0;
  doc["air_temp"]        = round(airTemp * 10.0) / 10.0;
  doc["air_humidity"]    = round(airHumidity * 10.0) / 10.0;
  doc["pump_status"]     = pumpState ? "ON" : "OFF";
  doc["water_flow"]      = round(flowRate * 10.0) / 10.0;
  doc["battery_level"]   = round(batteryLevel * 10.0) / 10.0;
  doc["battery_voltage"] = round(batteryVoltage * 100.0) / 100.0;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);
  if (httpCode == 200) {
    Serial.println("[TELEMETRI] ✓ Data berhasil dikirim ke server dashboard!");
  } else {
    Serial.printf("[TELEMETRI] ✕ Gagal mengirim data! HTTP Code: %d, Msg: %s\n",
                  httpCode, http.getString().c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n========================================================");
  Serial.println("🌿 HydroMind ESP32 Smart Greenhouse Production Firmware");
  Serial.println("========================================================");

  setPumpState(false); // Default awal: pompa OFF (mode INPUT dilepas)

  pinMode(PIN_SOIL_ANALOG, INPUT);
  pinMode(PIN_WATERFLOW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_WATERFLOW), pulseCounterISR, RISING);

  dht.begin();
  Serial.println("[DHT22] ✓ Sensor DHT22 diinisialisasi pada pin D14.");

  Serial.printf("[WIFI] Menghubungkan ke SSID: %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] ✓ Terhubung dengan sukses!");
    Serial.printf("[WIFI] IP Address ESP32: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] ✕ Gagal terhubung! Periksa SSID & Password WiFi.");
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Koneksi terputus. Mencoba reconnect...");
    WiFi.reconnect();
    delay(2000);
    return;
  }

  unsigned long currentMillis = millis();

  if (currentMillis - lastSendTime >= SEND_INTERVAL) {
    unsigned long durationMs = currentMillis - lastSendTime;
    lastSendTime = currentMillis;

    fetchServerCommand();

    float soilMoisture = readSoilMoisture();

    // Deteksi perpindahan mode (Manual <-> Auto)
    bool modeJustChanged = (systemMode != prevMode);
    if (modeJustChanged) {
      Serial.printf("[MODE] Perpindahan mode: %s -> %s\n", prevMode.c_str(), systemMode.c_str());
      prevMode = systemMode;
    }

    if (systemMode == "AUTO") {
      // ── MODE OTOMATIS: 100% bergantung sensor soil moisture ──────────────
      // Saat baru pindah dari Manual ke Auto, langsung evaluasi ulang
      // tanpa menunggu hysteresis — jadi state Manual tidak "terbawa"
      if (modeJustChanged) {
        // Evaluasi langsung: cek apakah tanah butuh air atau tidak
        if (soilMoisture < moistureUpper) {
          // Tanah masih di bawah batas atas → nyalakan pompa
          Serial.printf("[KONTROL AUTO] Mode baru aktif. Kelembapan (%.1f%%) < Ambang Atas (%.0f%%) -> POMPA ON\n",
                        soilMoisture, moistureUpper);
          setPumpState(true);
        } else {
          // Tanah sudah cukup basah → matikan pompa
          Serial.printf("[KONTROL AUTO] Mode baru aktif. Kelembapan (%.1f%%) >= Ambang Atas (%.0f%%) -> POMPA OFF\n",
                        soilMoisture, moistureUpper);
          setPumpState(false);
        }
      } else {
        // Operasi normal Auto: hysteresis (batas bawah ON, batas atas OFF)
        if (soilMoisture < moistureLower) {
          if (!isPumpActive) {
            Serial.printf("[KONTROL AUTO] Kelembapan (%.1f%%) < Ambang Bawah (%.0f%%) -> POMPA ON\n",
                          soilMoisture, moistureLower);
            setPumpState(true);
          }
        }
        else if (soilMoisture > moistureUpper) {
          if (isPumpActive) {
            Serial.printf("[KONTROL AUTO] Kelembapan (%.1f%%) > Ambang Atas (%.0f%%) -> POMPA OFF\n",
                          soilMoisture, moistureUpper);
            setPumpState(false);
          }
        }
        // Di antara bawah-atas: pertahankan state saat ini (hysteresis normal)
      }
    } else {
      // ── MODE MANUAL: 100% bergantung tombol ON/OFF di website ────────────
      bool targetState = (pumpManualCmd == "ON");
      if (isPumpActive != targetState) {
        Serial.printf("[KONTROL MANUAL] Perintah Server: %s -> Saklar Pompa %s\n",
                      pumpManualCmd.c_str(), targetState ? "ON" : "OFF");
      }
      setPumpState(targetState);
    }

    waterFlowRate = calculateWaterFlow(durationMs);

    postTelemetryData(soilMoisture, waterFlowRate, isPumpActive);

    Serial.println("--------------------------------------------------------");
  }
}
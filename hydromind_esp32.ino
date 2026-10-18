#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── 1. Konfigurasi Jaringan WiFi ─────────────────────────────────────────────
// Laptop kamu tersambung ke router "Hpras199". Karena ESP32 hanya bisa 2.4GHz:
const char* WIFI_SSID     = "Hpras199";       // Hubungkan ke frekuensi 2.4GHz
const char* WIFI_PASSWORD = "gohma8888";      // Password WiFi kamu

// ── 2. Konfigurasi Server Dashboard HydroMind ────────────────────────────────
// IP Laptop kamu saat ini (sesuai ipconfig terbaru: 192.168.1.9)
const char* SERVER_BASE_URL = "http://192.168.1.9:8000/api";
const char* DEVICE_NAME     = "GreenHouse 1";

// API Key yang tersimpan resmi di database saat ini
String apiKey = "W0FBoMLyvpzj9DdEk2M5dR5yZBFh79JEn0bZcXH7";

// ── 3. Pinout ESP32 ──────────────────────────────────────────────────────────
#define PIN_SOIL_ANALOG    34   // Input Analog Soil Moisture
#define PIN_WATERFLOW      27   // Input Pulsa Waterflow
#define PIN_PUMP_RELAY     26   // Output Kontrol Relay Pompa

// Jika saat "POMPA ON" pompa malah mati, ubah nilai ini menjadi false
const bool RELAY_ACTIVE_LOW = true;

// ── 4. Kalibrasi Sensor Kelembapan Tanah ─────────────────────────────────────
const int SOIL_ADC_DRY = 4000;  // Nilai saat kering di udara terbuka (0%)
const int SOIL_ADC_WET = 1600;  // Nilai saat tercelup air / basah (100%)

const float FLOW_CALIBRATION_FACTOR = 7.5;

volatile unsigned long pulseCount = 0;
float waterFlowRate = 0.0;

String systemMode    = "AUTO";
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
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(PIN_PUMP_RELAY, turnOn ? LOW : HIGH);
  } else {
    digitalWrite(PIN_PUMP_RELAY, turnOn ? HIGH : LOW);
  }
}

float readSoilMoisture() {
  long sum = 0;
  for (int i = 0; i < 15; i++) {
    sum += analogRead(PIN_SOIL_ANALOG);
    delay(5);
  }
  int adcValue = sum / 15;

  // Rumus persentase kelembapan (semakin kecil nilai ADC, semakin basah tanah)
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

  float airTemp = 28.5 + (random(-10, 15) / 10.0);
  float airHumidity = 65.0 + (random(-20, 20) / 10.0);
  float batteryVoltage = 12.0 + (random(-2, 2) / 10.0); // Baterai 12V
  float batteryLevel = map(batteryVoltage * 10, 105, 126, 0, 100);
  batteryLevel = constrain(batteryLevel, 10.0, 100.0);

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

  pinMode(PIN_PUMP_RELAY, OUTPUT);
  setPumpState(false);

  pinMode(PIN_SOIL_ANALOG, INPUT);
  pinMode(PIN_WATERFLOW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_WATERFLOW), pulseCounterISR, RISING);

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

    if (systemMode == "AUTO") {
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
    } else {
      bool targetState = (pumpManualCmd == "ON");
      if (isPumpActive != targetState) {
        Serial.printf("[KONTROL MANUAL] Saklar Pompa %s\n", targetState ? "ON" : "OFF");
        setPumpState(targetState);
      }
    }

    waterFlowRate = calculateWaterFlow(durationMs);

    postTelemetryData(soilMoisture, waterFlowRate, isPumpActive);

    Serial.println("--------------------------------------------------------");
  }
}
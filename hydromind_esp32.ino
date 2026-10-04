#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

const char* SERVER_BASE_URL = "http://192.168.1.10:8000/api";

const char* DEVICE_NAME = "Greenhouse ESP32 Unit 1";

String apiKey = "";

#define PIN_SOIL_ANALOG    34
#define PIN_WATERFLOW      27
#define PIN_PUMP_RELAY     26

const bool RELAY_ACTIVE_LOW = true;

const int SOIL_ADC_DRY = 3200;
const int SOIL_ADC_WET = 1400;

const float FLOW_CALIBRATION_FACTOR = 7.5;

volatile unsigned long pulseCount = 0;
float waterFlowRate = 0.0;

String systemMode    = "AUTO";
String pumpManualCmd = "OFF";
float moistureLower  = 40.0;
float moistureUpper  = 70.0;

bool isPumpActive = false;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000;

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
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_SOIL_ANALOG);
    delay(5);
  }
  int adcValue = sum / 10;

  float percentage = map(adcValue, SOIL_ADC_DRY, SOIL_ADC_WET, 0, 100);
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

bool registerDeviceIfNeeded() {
  if (apiKey.length() > 0) {
    Serial.printf("[AUTH] Menggunakan API Key yang terkonfigurasi: %s\n", apiKey.c_str());
    return true;
  }

  Serial.println("[AUTH] API Key kosong. Mengirim registrasi unit baru ke backend...");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi belum terhubung!");
    return false;
  }

  HTTPClient http;
  String registerUrl = String(SERVER_BASE_URL) + "/dashboard/devices";
  http.begin(registerUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");

  StaticJsonDocument<200> doc;
  doc["name"] = DEVICE_NAME;
  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);

  if (httpCode == 200 || httpCode == 201) {
    String response = http.getString();
    Serial.printf("[AUTH] Berhasil mendaftar! Response: %s\n", response.c_str());

    StaticJsonDocument<512> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (!error && respDoc.containsKey("api_key")) {
      apiKey = respDoc["api_key"].as<String>();
      Serial.println("=================================================");
      Serial.printf(">>> UNIT BERHASIL DIDAFTARKAN KE DASHBOARD! <<<\n");
      Serial.printf("ID Unit  : %d\n", respDoc["id"].as<int>());
      Serial.printf("API KEY  : %s\n", apiKey.c_str());
      Serial.println("=================================================");
      http.end();
      return true;
    }
  } else {
    Serial.printf("[AUTH] Registrasi gagal! HTTP Code: %d, Response: %s\n", httpCode, http.getString().c_str());
  }

  http.end();
  return false;
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
  float batteryVoltage = 12.1 + (random(-3, 3) / 10.0);
  float batteryLevel = map(batteryVoltage * 10, 90, 126, 0, 100);
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
  Serial.println("🌿 HydroMind ESP32 Smart Greenhouse Test Firmware");
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
    Serial.println("\n[WIFI] ✕ Gagal terhubung! Silakan periksa SSID & Password.");
  }

  registerDeviceIfNeeded();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Koneksi terputus. Mencoba menghubungkan kembali...");
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
          Serial.printf("[KONTROL AUTO] Kelembapan (%.1f%%) < Ambang Bawah (%.0f%%) -> NYALAKAN POMPA\n",
                        soilMoisture, moistureLower);
          setPumpState(true);
        }
      }
      else if (soilMoisture > moistureUpper) {
        if (isPumpActive) {
          Serial.printf("[KONTROL AUTO] Kelembapan (%.1f%%) > Ambang Atas (%.0f%%) -> MATIKAN POMPA\n",
                        soilMoisture, moistureUpper);
          setPumpState(false);
        }
      }
    } else {
      bool targetState = (pumpManualCmd == "ON");
      if (isPumpActive != targetState) {
        Serial.printf("[KONTROL MANUAL] Perintah Server: %s -> Saklar Pompa %s\n",
                      pumpManualCmd.c_str(), targetState ? "ON" : "OFF");
        setPumpState(targetState);
      }
    }

    waterFlowRate = calculateWaterFlow(durationMs);

    postTelemetryData(soilMoisture, waterFlowRate, isPumpActive);

    Serial.println("--------------------------------------------------------");
  }
}

/**
 * -----------------------------------------------------------
 * AQI Reference
 * -----------------------------------------------------------
 * Level | Description                          | Suggestion                                             | Recommended Stay Time
 * ----- | ------------------------------------ | ------------------------------------------------------ | ----------------------
 * 5     | Extremely bad                        | Strengthen ventilation, or leave                       | Not recommended to stay
 * 4     | Bad                                  | Strengthen ventilation, find sources of pollution      | Less than one month
 * 3     | Generally                            | Strengthen ventilation, close to the water source      | Less than 12 months
 * 2     | Good                                 | Maintain adequate ventilation                          | Suitable for long-term living
 * 1     | Excellent                            | No suggestion                                          | Suitable for long-term living
 *
 * -----------------------------------------------------------
 * eCO2/CO2 Concentration Reference
 * -----------------------------------------------------------
 * eCO2/CO2       | Level        | Suggestion
 * -------------- | ------------ | -------------------------------------------------------------
 * >= 1500        | Terrible     | Indoor air pollution is serious and requires ventilation
 * 1000 - 1500    | Bad          | Indoor air is polluted, ventilation is recommended
 * 800 - 1000     | Generally    | Can be ventilated
 * 600 - 800      | Good         | Keep it normal
 * 400 - 600      | Excellent    | No suggestion
 *
 * -----------------------------------------------------------
 * TVOC Concentration Reference
 * -----------------------------------------------------------
 * TOVC (ppb)     | Effects on Human Health
 * -------------  | ------------------------------------------------
 * > 6000         | Headaches and nerve problems
 * 750 - 6000     | Restlessness and headache
 * 50 - 750       | Restlessness and discomfort
 * < 50           | No effect
 * -----------------------------------------------------------
 */

#include <secrets.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino.h>
#include <Wire.h>
#include <Arduino_JSON.h>
#include <ESP32Servo.h>
#include <DFRobot_ENS160.h>
#include <DFRobot_BME280.h>

// Use a constexpr for sea level pressure in hPa (hectopascals).
constexpr float SEA_LEVEL_PRESSURE = 1015.0f;

DFRobot_ENS160_I2C ens160(&Wire, 0x53);
DFRobot_BME280_IIC bme(&Wire, 0x76);

Servo servo;
int servoPosition = 0;

void setup()
{
  Serial.begin(115200);
  delay(100);

  // Connect WiFi
  connectWiFi();

  // Initialize servo
  servo.attach(13, 300, 2460);
  moveServo(0);

  // Initialize BME280 sensor
  bme.reset();
  Serial.println(F("Initializing BME280 sensor..."));
  while (bme.begin() != DFRobot_BME280_IIC::eStatusOK)
  {
    Serial.println(F("BME280 init failed"));
    printBMEStatus(bme.lastOperateStatus);
    delay(2000);
  }
  Serial.println(F("BME280 init success"));
  delay(100);

  // Initialize ENS160 sensor
  Serial.println(F("Initializing ENS160 sensor..."));
  while (ens160.begin() != NO_ERR)
  {
    Serial.println(F("ENS160 init failed, please check wiring"));
    delay(3000);
  }
  Serial.println(F("ENS160 init success"));

  // Set ENS160 power mode to STANDARD for normal gas measurement
  ens160.setPWRMode(ENS160_STANDARD_MODE);
}

void loop()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println(F("WiFi connection lost. Attempting to reconnect in 5 seconds..."));
    delay(5000);
    connectWiFi();
  }

  // Read BME280
  float temperatureC = bme.getTemperature();
  uint32_t pressurePa = bme.getPressure();
  float humidityPct = bme.getHumidity();
  float altitudeM = bme.calAltitude(SEA_LEVEL_PRESSURE, pressurePa);

  // Read ENS160
  ens160.setTempAndHum(temperatureC, humidityPct);
  uint8_t ensStatus = ens160.getENS160Status();
  uint8_t aqi = ens160.getAQI();
  uint16_t tvoc = ens160.getTVOC();
  uint16_t eco2 = ens160.getECO2();

  // Print BME280 readings
  Serial.println();
  Serial.println(F("====== BME280 Readings ========"));
  Serial.print(F("Temperature (C):   "));
  Serial.println(temperatureC);
  Serial.print(F("Humidity (%):      "));
  Serial.println(humidityPct);
  Serial.print(F("Pressure (Pa):     "));
  Serial.println(pressurePa);
  Serial.print(F("Altitude (m):      "));
  Serial.println(altitudeM);

  // Print ENS160 readings
  Serial.println(F("====== ENS160 Readings ========"));
  Serial.print(F("Air Quality Index: "));
  Serial.println(aqi);
  Serial.print(F("eCO2 (ppm):        "));
  Serial.println(eco2);
  Serial.print(F("TVOC (ppb):        "));
  Serial.println(tvoc);
  Serial.print(F("Sensor Status:     "));
  Serial.println(ensStatus);

  determineServoPositionFromAQI(aqi);
  uploadSensorData(ensStatus, temperatureC, pressurePa, altitudeM, humidityPct, aqi, tvoc, eco2);
  delay(5000);
}

/**
 * @brief Connect to WiFi using the SSID and password defined in secrets.h.
 */
void connectWiFi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(F("Connecting to WiFi."));
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(F("."));
    delay(1000);
  }
  Serial.print(F("Connected! IP address: "));
  Serial.println(WiFi.localIP());
}

/**
 * @brief Prints the status code returned by BME sensor operations.
 * @param eStatus The status code from the BME280 library.
 */
void printBMEStatus(DFRobot_BME280_IIC::eStatus_t eStatus)
{
  switch (eStatus)
  {
  case DFRobot_BME280_IIC::eStatusOK:
    Serial.println(F("Everything OK"));
    break;
  case DFRobot_BME280_IIC::eStatusErr:
    Serial.println(F("Unknown error"));
    break;
  case DFRobot_BME280_IIC::eStatusErrDeviceNotDetected:
    Serial.println(F("Device not detected"));
    break;
  case DFRobot_BME280_IIC::eStatusErrParameter:
    Serial.println(F("Parameter error"));
    break;
  default:
    Serial.println(F("Unknown status"));
    break;
  }
}

/**
 * @brief Move servo from its current position to the specified position.
 * @param pos The position to move the servo to.
 */
void moveServo(int targetPosition)
{
  const int delayTime = 20;
  int startPos = servoPosition;
  if (startPos < targetPosition)
  {
    for (int pos = startPos; pos <= targetPosition; pos++)
    {
      servo.write(pos);
      delay(delayTime);
    }
  }
  else
  {
    for (int pos = startPos; pos >= targetPosition; pos--)
    {
      servo.write(pos);
      delay(delayTime);
    }
  }
  servoPosition = targetPosition;
}

/**
 * @brief Upload sensor data to the API.
 * @param ensStatus The status of the ENS160 sensor.
 * @param temperature The temperature in Celsius.
 * @param pressure The pressure in Pascals.
 * @param altitude The altitude in meters.
 * @param humidity The humidity in percentage.
 * @param aqi The Air Quality Index.
 * @param tvoc The Total Volatile Organic Compounds in ppb.
 * @param eco2 The eCO2 in ppm.
 */
void uploadSensorData(uint8_t ensStatus, float temperature, uint32_t pressure, float altitude, float humidity, uint8_t aqi, uint16_t tvoc, uint16_t eco2)
{
  Serial.println(F("====== Uploading Data ========="));
  HTTPClient http;

  // Create JSON payload
  JSONVar payload;
  payload["ensStatus"] = ensStatus;
  payload["temperature"] = temperature;
  payload["pressure"] = pressure;
  payload["altitude"] = altitude;
  payload["humidity"] = humidity;
  payload["aqi"] = aqi;
  payload["tvoc"] = tvoc;
  payload["eco2"] = eco2;

  // Send POST request
  http.begin(String(API_URL) + "/api/climate-readings");
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(JSON.stringify(payload));
  if (httpResponseCode == 200)
  {
    String response = http.getString();
    Serial.println(F("Upload successful!"));
    Serial.print(F("Response: "));
    Serial.println(httpResponseCode);
  }
  else
  {
    Serial.print(F("Error on sending POST request: "));
    Serial.println(F("Upload error."));
    Serial.print(F("Response: "));
    Serial.println(httpResponseCode);
  }
  http.end();
  Serial.println(F("==============================="));
}

/**
 * @brief Determine the servo position based on the Air Quality Index (AQI).
 * @param aqi The Air Quality Index.
 */
void determineServoPositionFromAQI(uint8_t aqi)
{
  if (aqi >= 3)
  {
    moveServo(180);
  }
  else if (aqi == 1)
  {
    moveServo(0);
  }
}

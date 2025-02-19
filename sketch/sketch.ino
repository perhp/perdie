/**
 * Refactored example using DFRobot ENS160 and DFRobot BME280.
 *
 * Make sure you have installed the required libraries:
 *   - DFRobot_ENS160
 *   - DFRobot_BME280
 *
 * Connections (typical I2C):
 *   - VCC to 3.3V/5V (depending on sensor board specs)
 *   - GND to GND
 *   - SCL to A5 (Arduino UNO) or SCL pin on other boards
 *   - SDA to A4 (Arduino UNO) or SDA pin on other boards
 */

#include <Arduino.h>
#include <Wire.h>
#include <DFRobot_ENS160.h>
#include <DFRobot_BME280.h>

// Use a constexpr for sea level pressure in hPa (hectopascals).
constexpr float SEA_LEVEL_PRESSURE = 1015.0f;

DFRobot_ENS160_I2C ens160(&Wire, 0x53);
DFRobot_BME280_IIC bme(&Wire, 0x76);

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

void setup()
{
  // Start the serial communication
  Serial.begin(115200);
  delay(100);

  // Initialize the BME280 sensor
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
  // Read BME280 environmental data
  float temperatureC = bme.getTemperature();
  uint32_t pressurePa = bme.getPressure();
  float humidityPct = bme.getHumidity();
  float altitudeM = bme.calAltitude(SEA_LEVEL_PRESSURE, pressurePa);

  // Provide fresh T/H data to ENS160 for accurate gas reading compensation
  ens160.setTempAndHum(temperatureC, humidityPct);

  // Print BME280 readings
  Serial.println();
  Serial.println(F("======== BME280 Readings ========"));
  Serial.print(F("Temperature (C): "));
  Serial.println(temperatureC);
  Serial.print(F("Pressure (Pa):   "));
  Serial.println(pressurePa);
  Serial.print(F("Altitude (m):    "));
  Serial.println(altitudeM);
  Serial.print(F("Humidity (%):    "));
  Serial.println(humidityPct);

  // Read ENS160 gas sensor data
  uint8_t ensStatus = ens160.getENS160Status();
  uint8_t aqi = ens160.getAQI();
  uint16_t tvoc = ens160.getTVOC();
  uint16_t eco2 = ens160.getECO2();

  // Print ENS160 readings
  Serial.println(F("======== ENS160 Readings ========"));
  Serial.print(F("Sensor Status (0=Normal): "));
  Serial.println(ensStatus);
  Serial.print(F("Air Quality Index (1=Excellent, 5=Unhealthy): "));
  Serial.println(aqi);
  Serial.print(F("TVOC (ppb): "));
  Serial.println(tvoc);
  Serial.print(F("eCO2 (ppm): "));
  Serial.println(eco2);
  Serial.println(F("=================================="));
  Serial.println();

  delay(10000);
}

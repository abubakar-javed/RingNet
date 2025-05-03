package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName

sealed class WeatherForecastResponse {
    data object Initial : WeatherForecastResponse()
    data object Loading : WeatherForecastResponse()

    data class Success(
        @SerializedName("clusterId")
        val clusterId: String,
        @SerializedName("location")
        val location: WeatherLocation,
        @SerializedName("userCount")
        val userCount: Int,
        @SerializedName("temperature")
        val temperature: Double,
        @SerializedName("feelsLike")
        val feelsLike: Double,
        @SerializedName("humidity")
        val humidity: Int,
        @SerializedName("windSpeed")
        val windSpeed: Double,
        @SerializedName("description")
        val description: String,
        @SerializedName("alerts")
        val alerts: List<String>,
        @SerializedName("timestamp")
        val timestamp: String,
        @SerializedName("metadata")
        val metadata: WeatherMetadata
    ) : WeatherForecastResponse()

    data class Error(
        val message: String
    ) : WeatherForecastResponse()
}

data class WeatherLocation(
    @SerializedName("latitude")
    val latitude: Double,
    @SerializedName("longitude")
    val longitude: Double,
    @SerializedName("placeName")
    val placeName: String
)

data class WeatherForecast(
    @SerializedName("date")
    val date: String,
    @SerializedName("temperature")
    val temperature: Double,
    @SerializedName("description")
    val description: String,
    @SerializedName("isHeatwave")
    val isHeatwave: Boolean,
    @SerializedName("_id")
    val id: String
)

data class WeatherMetadata(
    @SerializedName("forecast")
    val forecast: List<WeatherForecast>,
    @SerializedName("heatwaveAlert")
    val heatwaveAlert: Boolean,
    @SerializedName("userIds")
    val userIds: List<String>
)


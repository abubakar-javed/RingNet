package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.WeatherForecastResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface WeatherForecastService {
    @GET("weather/user-weather")
    suspend fun getWeatherForecast(
        @Header("Authorization") token: String,
        @Query("longitude") longitude: Double,
        @Query("latitude") latitude: Double
    ): WeatherForecastResponse.Success
}
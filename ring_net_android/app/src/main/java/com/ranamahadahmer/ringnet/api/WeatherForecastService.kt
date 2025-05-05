package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.WeatherForecastResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface WeatherForecastService {
    @GET("weather/user-weather")
    suspend fun getWeatherForecast(
        @Header("Authorization") token: String,
    ): WeatherForecastResponse.Success
}
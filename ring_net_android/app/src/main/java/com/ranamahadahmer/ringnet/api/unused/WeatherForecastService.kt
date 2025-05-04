package com.ranamahadahmer.ringnet.api.unused

import com.ranamahadahmer.ringnet.models.unused.WeatherForecastResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface WeatherForecastService {
    @GET("weather/user-weather")
    suspend fun getWeatherForecast(
        @Header("Authorization") token: String,

        ): WeatherForecastResponse.Success
}
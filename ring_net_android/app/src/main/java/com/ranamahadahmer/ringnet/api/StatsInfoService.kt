package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.StatsInfoResponse
import com.ranamahadahmer.ringnet.models.WeatherForecastResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface StatsInfoService {
    @GET("dashboard/stats")
    suspend fun getStatsInfo(
        @Header("Authorization") token: String,
        @Query("longitude") longitude: Double,
        @Query("latitude") latitude: Double
    ): StatsInfoResponse.Success
}
package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.TsunamiAlertResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface TsunamiAlertService {
    @GET("tsunami/user/alerts")
    suspend fun getTsunamiData(
        @Header("Authorization") token: String,
        @Query("longitude") longitude: Double,
        @Query("latitude") latitude: Double
    ): TsunamiAlertResponse.Success
}
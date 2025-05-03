package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.FloodDataResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface FloodDataService {
    @GET("flood/user/floods")
    suspend fun getFloodData(
        @Header("Authorization") token: String,
        @Query("longitude") longitude: Double,
        @Query("latitude") latitude: Double
    ): FloodDataResponse.Success
}


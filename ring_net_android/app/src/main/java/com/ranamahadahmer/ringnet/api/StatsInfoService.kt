package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.StatsInfoResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface StatsInfoService {
    @GET("dashboard/stats")
    suspend fun getStatsInfo(
        @Header("Authorization") token: String,

        ): StatsInfoResponse.Success
}
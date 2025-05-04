package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import retrofit2.http.GET
import retrofit2.http.Header


interface UserAlertsService {
    @GET("alerts/user-alerts")
    suspend fun getAlerts(
        @Header("Authorization") token: String,
    ): UserAlertsResponse.Success
}


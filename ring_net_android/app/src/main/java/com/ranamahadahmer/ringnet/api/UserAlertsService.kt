package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.EmergencyContact
import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Query

interface UserAlertsService {
    @GET("alerts/user-alerts")
    suspend fun getAlerts(
        @Header("Authorization") token: String,
    ): UserAlertsResponse.Success
}


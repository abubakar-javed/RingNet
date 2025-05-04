package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.UserNotificationResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface UserNotificationService {
    @GET("notifications/user-notifications")
    suspend fun getNotifications(
        @Header("Authorization") token: String,
    ): UserNotificationResponse.Success
}



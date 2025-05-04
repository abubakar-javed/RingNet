package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.UserNotificationResponse
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.Path

interface ReadUserNotificationService {
    @PATCH("notifications/{notificationId}/read")
    suspend fun readNotification(
        @Header("Authorization") token: String,
        @Path("notificationId") notificationId: String
    ): UserNotificationResponse.Success
}


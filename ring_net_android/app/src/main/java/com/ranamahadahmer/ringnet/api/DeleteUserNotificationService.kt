package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.UserNotificationResponse
import retrofit2.http.DELETE
import retrofit2.http.Header
import retrofit2.http.Path

interface DeleteUserNotificationService {
    @DELETE("notifications/{notificationId}")
    suspend fun deleteNotification(
        @Header("Authorization") token: String,
        @Path("notificationId") notificationId: String
    ): UserNotificationResponse.Success
}


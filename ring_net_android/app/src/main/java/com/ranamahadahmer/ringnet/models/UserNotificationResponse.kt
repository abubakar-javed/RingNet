package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName


sealed class UserNotificationResponse {
    data object Initial : UserNotificationResponse()
    data object Loading : UserNotificationResponse()

    data class Success(
        val notifications: List<NotificationInfo>,
        val total: Int,
        val page: Int,
        val totalPages: Int
    ) : UserNotificationResponse()

    data class Error(
        val message: String
    ) : UserNotificationResponse()
}

data class NotificationInfo(
    @SerializedName("_id") val id: String,
    val notificationId: String,
    val alertId: String,
    val hazardId: String,
    val hazardModel: String,
    val type: String,
    val severity: String,
    val location: String,
    val impactRadius: Int,
    val sentAt: String,
    val status: String,
    val message: String,
    val recipients: List<String>,
    val createdAt: String,
    val updatedAt: String,
    @SerializedName("__v") val version: Int
)


//data class NotificationInfo(
//    @SerializedName("_id") val id: String,
//    val notificationId: String,
//    val alertId: String,
//    val hazardId: String,
//    val hazardModel: String,
//    val type: String,
//    val severity: String,
//    val location: String,
//    val impactRadius: Int,
//    val sentAt: String,
//    val status: String,
//    val message: String,
//    val recipients: List<String>,
//    val createdAt: String,
//    val updatedAt: String,
//    @SerializedName("__v") val version: Int
//)
//
//sealed class UserNotificationResponse {
//    data object Initial : UserNotificationResponse()
//
//    data object Loading : UserNotificationResponse()
//
//    data class Success(
//        val notifications: List<NotificationInfo>,
//        val total: Int,
//        val page: Int,
//        val totalPages: Int
//    ) : UserNotificationResponse()
//
//    data class Error(val message: String) : UserNotificationResponse()
//}
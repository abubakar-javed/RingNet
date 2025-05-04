package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName


sealed class UserAlertsResponse {
    data object Initial : UserAlertsResponse()
    data object Loading : UserAlertsResponse()

    data class Success(
        val alerts: List<HazardAlertInfo>,
        val total: Int,
        val page: Int,
        val totalPages: Int
    ) : UserAlertsResponse()

    data class Error(
        val message: String
    ) : UserAlertsResponse()
}

data class Coordinates(
    val latitude: Double,
    val longitude: Double
)

data class HazardAlertInfo(
    val coordinates: Coordinates,
    @SerializedName("_id") val id: String,
    val type: String,
    val severity: String,
    val location: String,
    val timestamp: String,
    val hazardId: String,
    val hazardModel: String,
    val details: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String,
    @SerializedName("__v") val version: Int,
    val distance: Int
)

//data class HazardAlertInfo(
//    val severity: String,
//    val detail: String,
//    val type: String,
//    val timestamp: String,
//    val location: String,
//
//    )
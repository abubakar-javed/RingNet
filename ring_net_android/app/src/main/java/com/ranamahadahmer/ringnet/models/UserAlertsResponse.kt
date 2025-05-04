package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName
import com.ranamahadahmer.ringnet.models.common.Location


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


data class HazardAlertInfo(
    val coordinates: Location,
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




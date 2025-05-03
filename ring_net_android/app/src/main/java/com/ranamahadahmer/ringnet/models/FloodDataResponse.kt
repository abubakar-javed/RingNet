package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName

sealed class FloodDataResponse {
    data object Initial : FloodDataResponse()
    data object Loading : FloodDataResponse()

    data class Success(
        @SerializedName("location")
        val location: Location,
        @SerializedName("clusterId")
        val clusterId: String,
        @SerializedName("hasAlert")
        val hasAlert: Boolean,
        @SerializedName("alerts")
        val alerts: List<FloodAlert>
    ) : FloodDataResponse()

    data class Error(
        val message: String
    ) : FloodDataResponse()
}

data class FloodAlert(
    @SerializedName("date")
    val date: String,
    @SerializedName("discharge")
    val discharge: Double,
    @SerializedName("severity")
    val severity: String,
    @SerializedName("_id")
    val id: String
)


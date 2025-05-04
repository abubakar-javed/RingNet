package com.ranamahadahmer.ringnet.models.unused

import com.google.gson.annotations.SerializedName


sealed class TsunamiAlertResponse {
    data object Initial : TsunamiAlertResponse()
    data object Loading : TsunamiAlertResponse()

    data class Success(
        @SerializedName("location")
        val location: Location,
        @SerializedName("alerts")
        val alerts: List<TsunamiAlert>,
    ) : TsunamiAlertResponse()

    data class Error(
        val message: String
    ) : TsunamiAlertResponse()
}


data class Location(
    @SerializedName("latitude")
    val latitude: Double,
    @SerializedName("longitude")
    val longitude: Double
)

data class TsunamiAlert(
    @SerializedName("title")
    val title: String,
    @SerializedName("date")
    val date: String,
    @SerializedName("message")
    val message: String,
    @SerializedName("severity")
    val severity: String,
    @SerializedName("distance")
    val distance: Double,
    @SerializedName("link")
    val link: String
)



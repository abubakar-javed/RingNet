package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName

data class LocationUpdateRequest(
    @SerializedName("location")
    val location: LocationCoordinates
)

data class LocationCoordinates(
    @SerializedName("latitude")
    val latitude: Double,
    @SerializedName("longitude")
    val longitude: Double
)

data class LocationUpdateResponse(

    @SerializedName("message") val message: String
)
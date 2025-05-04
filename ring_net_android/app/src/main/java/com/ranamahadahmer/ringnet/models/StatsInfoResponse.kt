package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName
import com.ranamahadahmer.ringnet.models.unused.Location

sealed class StatsInfoResponse {
    data object Initial : StatsInfoResponse()
    data object Loading : StatsInfoResponse()

    data class Success(
        @SerializedName("stats")
        val stats: Stats,
        @SerializedName("location")
        val location: Location
    ) : StatsInfoResponse()

    data class Error(
        val message: String
    ) : StatsInfoResponse()
}

data class Stats(
    @SerializedName("earthquakes")
    val earthquakes: Int,
    @SerializedName("tsunamis")
    val tsunamis: Int,
    @SerializedName("floods")
    val floods: Int,
    @SerializedName("heatwaves")
    val heatwaves: Int
)
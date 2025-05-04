package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName
import com.ranamahadahmer.ringnet.models.common.Location


data class ProfileData(
    @SerializedName("location")
    val location: Location,
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val phone: String?,
    val description: String,
    val locationString: String,
    val alertPreferences: List<String>,
    val createdAt: String,
    val updatedAt: String,
    @SerializedName("__v")
    val v: Int,
)

sealed class ProfileResponse {
    object Initial : ProfileResponse()
    object Loading : ProfileResponse()
    data class Success(
        @SerializedName("location")
        val location: Location,
        @SerializedName("_id")
        val id: String,
        val name: String,
        val email: String,
        val phone: String?,
        val description: String,
        val locationString: String,
        val alertPreferences: List<String>,
        val createdAt: String,
        val updatedAt: String,
        @SerializedName("__v")
        val v: Int,
    ) : ProfileResponse()

    data class Error(val message: String) : ProfileResponse()
}



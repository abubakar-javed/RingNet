package com.ranamahadahmer.ringnet.models

import com.google.gson.annotations.SerializedName


sealed class AuthResponse {

    data object Initial : AuthResponse()
    data object Loading : AuthResponse()

    data class Success(
        @SerializedName("message")
        val message: String,
        @SerializedName("token")
        val token: String,
        @SerializedName("userId")
        val userId: String
    ) : AuthResponse()

    data class Error(
        val message: String
    ) : AuthResponse()
}
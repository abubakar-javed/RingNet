package com.ranamahadahmer.ringnet.models.auth

data class SignInRequestBody(
    val email: String,
    val password: String
)
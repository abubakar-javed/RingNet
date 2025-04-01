package com.ranamahadahmer.ringnet.models.auth

data class SignUpRequestBody(
    val name: String,
    val email: String,
    val password: String
)
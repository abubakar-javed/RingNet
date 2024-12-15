package com.ranamahadahmer.ringnet.models

data class SignUpRequestBody(
    val name: String,
    val email: String,
    val password: String
)
package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.AuthResponse
import com.ranamahadahmer.ringnet.models.SignUpRequestBody
import retrofit2.http.Body
import retrofit2.http.POST

interface SignUpService {
    @POST("auth/register")
    suspend fun signUp(
        @Body request: SignUpRequestBody
    ): AuthResponse.Success
}
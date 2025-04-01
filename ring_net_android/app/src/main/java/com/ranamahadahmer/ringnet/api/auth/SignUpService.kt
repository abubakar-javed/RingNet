package com.ranamahadahmer.ringnet.api.auth

import com.ranamahadahmer.ringnet.models.auth.AuthResponse
import com.ranamahadahmer.ringnet.models.auth.SignUpRequestBody
import retrofit2.http.Body
import retrofit2.http.POST

interface SignUpService {
    @POST("auth/register")
    suspend fun signUp(
        @Body request: SignUpRequestBody
    ): AuthResponse.Success
}
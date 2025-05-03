package com.ranamahadahmer.ringnet.api.auth

import com.ranamahadahmer.ringnet.models.auth.AuthResponse
import com.ranamahadahmer.ringnet.models.auth.SignInRequestBody
import retrofit2.http.Body
import retrofit2.http.POST


interface SignInService {
    @POST("auth/login")
    suspend fun signIn(
        @Body request: SignInRequestBody
    ): AuthResponse.Success
}


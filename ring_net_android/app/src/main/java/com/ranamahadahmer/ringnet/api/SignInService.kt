package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.AuthResponse
import com.ranamahadahmer.ringnet.models.SignInRequestBody
import retrofit2.http.Body
import retrofit2.http.POST


interface SignInService {
    @POST("auth/login")
    suspend fun signIn(
        @Body request: SignInRequestBody
    ): AuthResponse.Success
}
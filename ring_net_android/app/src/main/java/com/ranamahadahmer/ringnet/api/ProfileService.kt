package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.ProfileData
import com.ranamahadahmer.ringnet.models.ProfileResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PUT


interface ProfileService {
    @GET("users/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String,
    ): ProfileResponse.Success

    @PUT("users/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: ProfileData
    ): ProfileResponse.Success
}



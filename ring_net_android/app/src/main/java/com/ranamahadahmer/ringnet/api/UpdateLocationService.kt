package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.LocationUpdateRequest
import com.ranamahadahmer.ringnet.models.LocationUpdateResponse
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.PUT

interface UpdateLocationService {
    @PUT("users/location")
    suspend fun updateLocation(
        @Header("Authorization") token: String,
        @Body location: LocationUpdateRequest
    ): LocationUpdateResponse
}


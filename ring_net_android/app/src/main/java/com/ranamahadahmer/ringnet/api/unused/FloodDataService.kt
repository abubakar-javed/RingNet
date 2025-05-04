package com.ranamahadahmer.ringnet.api.unused

import com.ranamahadahmer.ringnet.models.unused.FloodDataResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface FloodDataService {
    @GET("flood/user/floods")
    suspend fun getFloodData(
        @Header("Authorization") token: String,

        ): FloodDataResponse.Success
}


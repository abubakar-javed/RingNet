package com.ranamahadahmer.ringnet.api.unused

import com.ranamahadahmer.ringnet.models.unused.TsunamiAlertResponse
import retrofit2.http.GET
import retrofit2.http.Header

interface TsunamiAlertService {
    @GET("tsunami/user/alerts")
    suspend fun getTsunamiData(
        @Header("Authorization") token: String,

        ): TsunamiAlertResponse.Success
}
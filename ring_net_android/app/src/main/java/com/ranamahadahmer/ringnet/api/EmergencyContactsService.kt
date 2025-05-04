package com.ranamahadahmer.ringnet.api

import com.ranamahadahmer.ringnet.models.EmergencyContact
import retrofit2.http.GET
import retrofit2.http.Header


interface EmergencyContactsService {
    @GET("emergency-contacts")
    suspend fun getContacts(
        @Header("Authorization") token: String,

        ): List<EmergencyContact>
}
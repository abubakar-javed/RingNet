package com.ranamahadahmer.ringnet.api.emergency_contacts

import com.ranamahadahmer.ringnet.models.emergency_contacts.EmergencyContact
import retrofit2.http.GET
import retrofit2.http.Header

import retrofit2.http.Query

interface EmergencyContactsService {
    @GET("emergency-contacts")
    suspend fun getContacts(
        @Header("Authorization") token: String,
        @Query("longitude") longitude: Double,
        @Query("latitude") latitude: Double
    ): List<EmergencyContact>
}


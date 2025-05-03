package com.ranamahadahmer.ringnet.models.emergency_contacts


sealed class EmergencyContactsResponse {
    data object Initial : EmergencyContactsResponse()
    data object Loading : EmergencyContactsResponse()

    data class Success(
        val list: List<EmergencyContact>,
    ) : EmergencyContactsResponse()

    data class Error(
        val message: String
    ) : EmergencyContactsResponse()
}


data class EmergencyContact(
    val dept: String,
    val contact: String,
    val status: String
)

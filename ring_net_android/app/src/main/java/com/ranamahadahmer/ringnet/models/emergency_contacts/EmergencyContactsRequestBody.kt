package com.ranamahadahmer.ringnet.models.emergency_contacts

import com.google.gson.annotations.SerializedName

data class EmergencyContactsRequestBody(
    @SerializedName("latitude")
    val latitude: Double,
    @SerializedName("longitude")
    val longitude: Double,
)


//[
//{
//    "dept": "Police",
//    "contact": "911",
//    "status": "Available"
//},
//{
//    "dept": "Fire Department",
//    "contact": "912",
//    "status": "Available"
//},
//{
//    "dept": "Ambulance",
//    "contact": "108",
//    "status": "Available"
//},
//{
//    "dept": "Disaster Management",
//    "contact": "1077",
//    "status": "Available"
//}
//]
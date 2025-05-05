package com.ranamahadahmer.ringnet.models


//sealed class UserNotificationResponse {
//    data object Initial : UserNotificationResponse()
//    data object Loading : UserNotificationResponse()
//
//    data class Success(
//        val notifications: List<NotificationInfo>,
//        val total: Int,
//        val page: Int,
//        val totalPages: Int
//    ) : UserNotificationResponse()
//
//    data class Error(
//        val message: String
//    ) : UserNotificationResponse()
//}
//
//data class NotificationInfo(
//    @SerializedName("_id") val id: String,
//    val notificationId: String,
//    val alertId: String,
//    val hazardId: String,
//    val hazardModel: String,
//    val type: String,
//    val severity: String,
//    val location: String,
//    val impactRadius: Int,
//    val sentAt: String,
//    val status: String,
//    val message: String,
//    val recipients: List<String>,
//    val createdAt: String,
//    val updatedAt: String,
//    @SerializedName("__v") val version: Int
//)

import android.os.Parcel
import android.os.Parcelable
import com.google.gson.annotations.SerializedName


data class NotificationInfo(
    @SerializedName("_id") val id: String,
    val notificationId: String,
    val alertId: String,
    val hazardId: String,
    val hazardModel: String,
    val type: String,
    val severity: String,
    val location: String,
    val impactRadius: Int,
    val sentAt: String,
    val status: String,
    val message: String,
    val recipients: List<String>,
    val createdAt: String,
    val updatedAt: String,
    @SerializedName("__v") val version: Int
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readInt(),
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.createStringArrayList() ?: listOf(),
        parcel.readString() ?: "",
        parcel.readString() ?: "",
        parcel.readInt()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(id)
        parcel.writeString(notificationId)
        parcel.writeString(alertId)
        parcel.writeString(hazardId)
        parcel.writeString(hazardModel)
        parcel.writeString(type)
        parcel.writeString(severity)
        parcel.writeString(location)
        parcel.writeInt(impactRadius)
        parcel.writeString(sentAt)
        parcel.writeString(status)
        parcel.writeString(message)
        parcel.writeStringList(recipients)
        parcel.writeString(createdAt)
        parcel.writeString(updatedAt)
        parcel.writeInt(version)
    }

    override fun describeContents(): Int = 0

    companion object CREATOR : Parcelable.Creator<NotificationInfo> {
        override fun createFromParcel(parcel: Parcel): NotificationInfo {
            return NotificationInfo(parcel)
        }

        override fun newArray(size: Int): Array<NotificationInfo?> {
            return arrayOfNulls(size)
        }
    }
}

sealed class UserNotificationResponse : Parcelable {
    data object Initial : UserNotificationResponse() {
        @JvmField
        val CREATOR = object : Parcelable.Creator<Initial> {
            override fun createFromParcel(parcel: Parcel) = Initial
            override fun newArray(size: Int) = arrayOfNulls<Initial>(size)
        }

        override fun writeToParcel(parcel: Parcel, flags: Int) {}
        override fun describeContents(): Int = 0
    }

    data object Loading : UserNotificationResponse() {
        @JvmField
        val CREATOR = object : Parcelable.Creator<Loading> {
            override fun createFromParcel(parcel: Parcel) = Loading
            override fun newArray(size: Int) = arrayOfNulls<Loading>(size)
        }

        override fun writeToParcel(parcel: Parcel, flags: Int) {}
        override fun describeContents(): Int = 0
    }

    data class Success(
        val notifications: List<NotificationInfo>,
        val total: Int,
        val page: Int,
        val totalPages: Int
    ) : UserNotificationResponse() {
        constructor(parcel: Parcel) : this(
            parcel.createTypedArrayList(NotificationInfo.CREATOR) ?: listOf(),
            parcel.readInt(),
            parcel.readInt(),
            parcel.readInt()
        )

        override fun writeToParcel(parcel: Parcel, flags: Int) {
            parcel.writeTypedList(notifications)
            parcel.writeInt(total)
            parcel.writeInt(page)
            parcel.writeInt(totalPages)
        }

        override fun describeContents(): Int = 0

        companion object CREATOR : Parcelable.Creator<Success> {
            override fun createFromParcel(parcel: Parcel): Success {
                return Success(parcel)
            }

            override fun newArray(size: Int): Array<Success?> {
                return arrayOfNulls(size)
            }
        }
    }

    data class Error(val message: String) : UserNotificationResponse() {
        constructor(parcel: Parcel) : this(parcel.readString() ?: "")

        override fun writeToParcel(parcel: Parcel, flags: Int) {
            parcel.writeString(message)
        }

        override fun describeContents(): Int = 0

        companion object CREATOR : Parcelable.Creator<Error> {
            override fun createFromParcel(parcel: Parcel): Error {
                return Error(parcel)
            }

            override fun newArray(size: Int): Array<Error?> {
                return arrayOfNulls(size)
            }
        }
    }
}
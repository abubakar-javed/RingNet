package com.ranamahadahmer.ringnet.view_models

import androidx.lifecycle.ViewModel
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.POST


interface SignInService {
    @POST("auth/login")
    fun signIn(email: String, password: String): SignInResponse.Success
}


sealed class SignInResponse {
    data object Loading : SignInResponse()

    @Serializable
    data class Success(
        @SerializedName("message")
        val message: String,
        @SerializedName("token")
        val token: String,
        @SerializedName("userId")
        val userId: String
    ) : SignInResponse()

    data class Error(
        val message: String
    ) : SignInResponse()
}


val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl("https://localhost:3000/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

val apiService: SignInService = retrofit.create(SignInService::class.java)


class SignInViewModel : ViewModel() {

    val response: MutableStateFlow<SignInResponse> =
        MutableStateFlow(SignInResponse.Loading)

    val email: MutableStateFlow<String> = MutableStateFlow("")
    val password: MutableStateFlow<String> = MutableStateFlow("")

    fun signIn(email: String, password: String) {
        try {
            response.value = apiService.signIn(email, password)
        } catch (e: Exception) {
            response.value = SignInResponse.Error(e.message ?: "An error occurred")
        }
    }
}
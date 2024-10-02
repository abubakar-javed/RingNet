package com.ranamahadahmer.ringnet.view_models

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

@Serializable
data class SignInRequestBody(
    val email: String,
    val password: String
)

interface SignInService {
    @POST("auth/login")
    suspend fun signIn(
        @Body request: SignInRequestBody
    ): SignInResponse.Success
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
        .baseUrl("http://10.7.240.183:3000/api/")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

val apiService: SignInService = retrofit.create(SignInService::class.java)


class SignInViewModel : ViewModel() {

    private val _response: MutableStateFlow<SignInResponse> =
        MutableStateFlow(SignInResponse.Loading)
    val response: StateFlow<SignInResponse> get() = _response

    private val email: MutableStateFlow<String> = MutableStateFlow("")
    private val password: MutableStateFlow<String> = MutableStateFlow("")

    fun signIn() {
        viewModelScope.launch {
            try {
                val request = SignInRequestBody(email.value, password.value)
                val result = apiService.signIn(request)
                _response.value =
                    SignInResponse.Success(result.message, result.token, result.userId)
            } catch (e: Exception) {
                _response.value = SignInResponse.Error(e.message ?: "An error occurred")

            }
        }
    }

    fun changeEmail(value: String) {
        email.value = value
    }

    fun changePassword(value: String) {
        password.value = value
    }
}
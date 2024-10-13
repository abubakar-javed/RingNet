package com.ranamahadahmer.ringnet.view_models

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.annotations.SerializedName
import com.ranamahadahmer.ringnet.api.AuthBackendApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.POST

@Serializable
data class SignUpRequestBody(
    val email: String,
    val password: String
)

interface SignUpService {
    @POST("auth/signup")
    suspend fun signUp(
        @Body request: SignUpRequestBody
    ): SignUpResponse.Success
}


sealed class SignUpResponse {

    data object Initial : SignUpResponse()
    data object Loading : SignUpResponse()

    @Serializable
    data class Success(
        @SerializedName("message")
        val message: String,
        @SerializedName("token")
        val token: String,
        @SerializedName("userId")
        val userId: String
    ) : SignUpResponse()

    data class Error(
        val message: String
    ) : SignUpResponse()
}


class SignUpViewModel : ViewModel() {
    private var apiService: SignUpService =
        AuthBackendApi.retrofit.create(SignUpService::class.java)

    private val _response: MutableStateFlow<SignUpResponse> =
        MutableStateFlow(SignUpResponse.Initial)
    val response: StateFlow<SignUpResponse> get() = _response

    private val email: MutableStateFlow<String> = MutableStateFlow("")
    private val password: MutableStateFlow<String> = MutableStateFlow("")

    fun signIn() {


        viewModelScope.launch {
            _response.value = SignUpResponse.Loading
            try {

            } catch (e: Exception) {
                _response.value = SignUpResponse.Error(e.message ?: "An error occurred")
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


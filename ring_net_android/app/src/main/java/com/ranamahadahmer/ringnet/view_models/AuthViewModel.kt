package com.ranamahadahmer.ringnet.view_models

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ranamahadahmer.ringnet.api.AuthBackendApi
import com.ranamahadahmer.ringnet.api.SignInService
import com.ranamahadahmer.ringnet.models.AuthResponse
import com.ranamahadahmer.ringnet.models.SignInRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


class AuthViewModel : ViewModel() {
    private var apiService: SignInService =
        AuthBackendApi.retrofit.create(SignInService::class.java)

    private val _signInResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signInResponse: StateFlow<AuthResponse> get() = _signInResponse

    private val _signUpResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signUpResponse: StateFlow<AuthResponse> get() = _signUpResponse


    private val _email: MutableStateFlow<String> = MutableStateFlow("")
    val email: StateFlow<String> get() = _email
    private val _firstName: MutableStateFlow<String> = MutableStateFlow("")
    val firstName: StateFlow<String> get() = _firstName
    private val _lastName: MutableStateFlow<String> = MutableStateFlow("")
    val lastName: StateFlow<String> get() = _lastName
    private val _passwordOne: MutableStateFlow<String> = MutableStateFlow("")
    val passwordOne: StateFlow<String> get() = _passwordOne
    private val _passwordTwo: MutableStateFlow<String> = MutableStateFlow("")
    val passwordTwo: StateFlow<String> get() = _passwordTwo
    fun changeFirstName(value: String) {
        _firstName.value = value
    }

    fun changeLastName(value: String) {
        _lastName.value = value
    }

    fun changeEmail(value: String) {
        _email.value = value
        println(_email.value)
    }

    fun changePasswordOne(value: String) {
        _passwordOne.value = value
    }

    fun changePasswordTwo(value: String) {
        _passwordTwo.value = value
    }

    fun signIn() {


        viewModelScope.launch {
            _signInResponse.value = AuthResponse.Loading
            try {
                val request = SignInRequestBody(_email.value, _passwordOne.value)
                val result = withContext(Dispatchers.IO) { apiService.signIn(request) }
                _signInResponse.value =
                    AuthResponse.Success(result.message, result.token, result.userId)

            } catch (e: Exception) {
                _signInResponse.value = AuthResponse.Error(e.message ?: "An error occurred")

            }
        }
    }


    fun signUp() {
        println("Name = ${_firstName.value} ${_lastName.value}")
        println("Email = ${_email.value}")
        println("Passwords = ${_passwordOne.value} == ${_passwordTwo.value}")
//        viewModelScope.launch {
//            _response.value = SignUpResponse.Loading
//            try {
//                val request = SignUpRequestBody(name = "$firstName $lastName",
//                    email = email.value,
//                    password = passwordOne.value)
//                val result = withContext(Dispatchers.IO) { apiService.signUp(request) }
//                _response.value =
//                    SignUpResponse.Success(result.message, result.token, result.userId)
//            } catch (e: Exception) {
//                _response.value = SignUpResponse.Error(e.message ?: "An error occurred")
//            }
//        }
    }
}


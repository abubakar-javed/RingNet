package com.ranamahadahmer.ringnet.view_models

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ranamahadahmer.ringnet.api.AuthBackendApi
import com.ranamahadahmer.ringnet.api.SignInService
import com.ranamahadahmer.ringnet.api.SignUpService
import com.ranamahadahmer.ringnet.database.DataStoreManager
import com.ranamahadahmer.ringnet.models.AuthResponse
import com.ranamahadahmer.ringnet.models.SignInRequestBody
import com.ranamahadahmer.ringnet.models.SignUpRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


class AuthViewModel(context: Context) : ViewModel() {
    private val _signInApiService: SignInService =
        AuthBackendApi.retrofit.create(SignInService::class.java)
    private val _signUpApiService: SignUpService =
        AuthBackendApi.retrofit.create(SignUpService::class.java)

    private val _signInResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signInResponse: StateFlow<AuthResponse> get() = _signInResponse

    private val _signUpResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signUpResponse: StateFlow<AuthResponse> get() = _signUpResponse

    val dataStoreManager = DataStoreManager(context = context)


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
    private val _token: MutableStateFlow<String?> = MutableStateFlow(null)
    val token: StateFlow<String?> get() = _token
    private val _userId: MutableStateFlow<String?> = MutableStateFlow(null)
    val userId: StateFlow<String?> get() = _userId


    fun changeFirstName(value: String) {
        _firstName.value = value.trim()
    }

    fun changeLastName(value: String) {
        _lastName.value = value.trim()
    }

    fun changeEmail(value: String) {
        _email.value = value.trim()

    }

    fun changePasswordOne(value: String) {
        _passwordOne.value = value.trim()
    }

    fun changePasswordTwo(value: String) {
        _passwordTwo.value = value.trim()
    }

    fun passwordsMatch(): Boolean {
        return _passwordOne.value == _passwordTwo.value
    }


    fun emailValid(): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(_email.value).matches()
    }

    fun emailEmpty(): Boolean {
        return _email.value.isEmpty()
    }

    fun passwordValid(): Boolean {
        return _passwordOne.value.length >= 6
    }

    fun signUpValid(): Boolean {
        return _firstName.value.isNotEmpty() && _lastName.value.isNotEmpty() && _email.value.isNotEmpty() && _passwordOne.value.isNotEmpty() && _passwordTwo.value.isNotEmpty()
    }

    init {
        viewModelScope.launch {
            dataStoreManager.token.collect { _token.value = it.orEmpty() }
        }
        viewModelScope.launch {
            dataStoreManager.userId.collect { _userId.value = it.orEmpty() }
        }
    }

    fun signIn() {


        viewModelScope.launch {
            _signInResponse.value = AuthResponse.Loading
            try {
                val request = SignInRequestBody(_email.value, _passwordOne.value)
                val result = withContext(Dispatchers.IO) { _signInApiService.signIn(request) }
                _signInResponse.value =
                    AuthResponse.Success(result.message, result.token, result.userId)
                dataStoreManager.insertData(mapOf("token" to result.token,
                    "userId" to result.userId))
                print("I GUESS DATA WAS WRITTEN")

            } catch (e: Exception) {
                _signInResponse.value = AuthResponse.Error(e.message ?: "An error occurred")

            }
        }
    }


    fun signUp() {
        println("Name = ${_firstName.value} ${_lastName.value}")
        println("Email = ${_email.value}")
        println("Passwords = ${_passwordOne.value} == ${_passwordTwo.value}")
        viewModelScope.launch {
            _signUpResponse.value = AuthResponse.Loading
            try {
                val request = SignUpRequestBody(name = "$firstName $lastName",
                    email = email.value,
                    password = passwordOne.value)
                val result = withContext(Dispatchers.IO) { _signUpApiService.signUp(request) }
                _signUpResponse.value =
                    AuthResponse.Success(result.message, result.token, result.userId)
                println("Response = $result")
                dataStoreManager.insertData(mapOf("token" to result.token,
                    "userId" to result.userId))
            } catch (e: Exception) {
                _signUpResponse.value = AuthResponse.Error(e.message ?: "An error occurred")
            }
        }
    }
}

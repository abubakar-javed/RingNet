//import java.util.Locale
//import java.util.concurrent.TimeUnit
//
//class AppViewModel(
//    val authViewModel: AuthViewModel,
//    val context: Context
//) : ViewModel() {
//
//    companion object {
//        private const val MAX_RETRIES = 3
//        private const val RETRY_DELAY_MS = 1000L
//    }
//
//
//    private val _modifiedNotifications = MutableStateFlow<Set<String>>(emptySet())
//
//
//    private val _userNotificationService: UserNotificationService =
//        BackendApi.retrofit.create(UserNotificationService::class.java)
//
//    private val _readUserNotificationService: ReadUserNotificationService =
//        BackendApi.retrofit.create(ReadUserNotificationService::class.java)
//    private val _deleteUserNotificationService: DeleteUserNotificationService =
//        BackendApi.retrofit.create(DeleteUserNotificationService::class.java)
//
//
//    private val _userNotifications =
//        MutableStateFlow<UserNotificationResponse>(UserNotificationResponse.Initial)
//
//
//    val userNotifications: StateFlow<UserNotificationResponse> = _userNotifications
//
//
//    fun changeNotificationReadStatus(notification: NotificationInfo) {
//        viewModelScope.launch {
//            // Add to modified set
//            _modifiedNotifications.value = _modifiedNotifications.value + notification.id
//
//            try {
//                _readUserNotificationService.readNotification(
//                    token = "Bearer ${authViewModel.token.value}",
//                    notificationId = notification.id
//                )
//
//                val updatedNotifications =
//                    (_userNotifications.value as UserNotificationResponse.Success).notifications.map {
//                        if (it == notification) it.copy(status = "Read") else it
//                    }
//                _userNotifications.value =
//                    (_userNotifications.value as UserNotificationResponse.Success).copy(
//                        notifications = updatedNotifications
//                    )
//
//
//                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
//            } catch (e: kotlin.Exception) {
//                // Handle error
//
//                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
//            }
//        }
//    }
//
//    fun deleteNotification(notification: NotificationInfo) {
//        viewModelScope.launch {
//            // Add to modified set
//            _modifiedNotifications.value = _modifiedNotifications.value + notification.id
//
//            try {
//                _deleteUserNotificationService.deleteNotification(
//                    token = "Bearer ${authViewModel.token.value}",
//                    notificationId = notification.id
//                )
//
//                val updatedNotifications =
//                    (_userNotifications.value as UserNotificationResponse.Success).notifications.filter {
//                        it != notification
//                    }
//                _userNotifications.value =
//                    (_userNotifications.value as UserNotificationResponse.Success).copy(
//                        notifications = updatedNotifications
//                    )
//
//                // Remove from modified set after successful deletion
//                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
//            } catch (e: kotlin.Exception) {
//                // Handle error
//
//                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
//            }
//        }
//    }
//
//
//    fun updateLocation(location: Location) {
//        _currentLocation.value = LatLng(location.latitude, location.longitude)
//    }
//
//
//    fun startLocationMonitoring(isAuthenticated: Boolean, getLocation: () -> Unit) {
//        if (!isAuthenticated) {
//            locationMonitoringJob?.cancel()
//            return
//        }
//
//        locationMonitoringJob = viewModelScope.launch {
//            while (true) {
//                getLocation()
//                if (_currentLocation.value == null) {
//                    delay(
//                        TimeUnit.SECONDS.toMillis(
//                            1
//                        )
//                    )
//                    continue
//                }
//                viewModelScope.launch {
//                    val response = withContext(Dispatchers.IO) {
//                        _updateLocationService.updateLocation(
//                            token = "Bearer ${authViewModel.token.value}",
//                            location = LocationUpdateRequest(
//                                location = LocationCoordinates(
//                                    latitude = _currentLocation.value!!.latitude,
//                                    longitude = _currentLocation.value!!.longitude
//                                )
//                            )
//                        )
//                    }
//                    if (response.message == "Location updated successfully") {
//                        println("Location Updated successfully")
//                    } else {
//                        println("Failed to update location: ${response.message}")
//                        delay(
//                            TimeUnit.SECONDS.toMillis(
//                                2
//                            )
//                        )
//                        return@launch
//                    }
//                }
//                loadData()
//                _locationDetails.value = getLocationDetails(
//                    context,
//                    _currentLocation.value!!.latitude,
//                    _currentLocation.value!!.longitude
//                )
//                delay(
//                    TimeUnit.MINUTES.toMillis(
//                        5
//                    )
//                )
//            }
//        }
//    }
//
//
//    override fun onCleared() {
//        super.onCleared()
//
//        locationMonitoringJob?.cancel()
//
//    }
//
//
//    fun getUserNotifications() {
//        viewModelScope.launch {
//            while (true) {
//                if (_userNotifications.value == UserNotificationResponse.Initial) {
//                    _userNotifications.value = UserNotificationResponse.Loading
//                }
//
//                repeat(MAX_RETRIES) { attempt ->
//                    try {
//                        val result = withContext(Dispatchers.IO) {
//                            _userNotificationService.getNotifications(
//                                token = "Bearer ${authViewModel.token.value}",
//                            )
//                        }
//                        when (_userNotifications.value) {
//                            is UserNotificationResponse.Success -> {
//                                // Filter out notifications that are being modified
//                                val filteredNotifications =
//                                    result.notifications.filter { notification ->
//                                        !_modifiedNotifications.value.contains(notification.id)
//                                    }
//
//                                // Combine with current notifications that are being modified
//                                val currentNotifications =
//                                    (_userNotifications.value as UserNotificationResponse.Success).notifications
//                                val modifiedCurrentNotifications =
//                                    currentNotifications.filter { notification ->
//                                        _modifiedNotifications.value.contains(notification.id)
//                                    }
//
//                                val updatedNotifications =
//                                    filteredNotifications + modifiedCurrentNotifications
//
//                                if (updatedNotifications != currentNotifications) {
//                                    _userNotifications.value =
//                                        result.copy(notifications = updatedNotifications)
//                                }
//                            }
//
//                            is UserNotificationResponse.Loading -> {
//                                _userNotifications.value = result
//                            }
//
//                            else -> {}
//                        }
//                        delay(1000)
//                    } catch (e: kotlin.Exception) {
//                        if (attempt == MAX_RETRIES - 1) {
//                            _userNotifications.value = UserNotificationResponse.Error(
//                                e.message ?: "An unknown error occurred"
//                            )
//                        } else {
//                            delay(RETRY_DELAY_MS)
//                        }
//                    }
//                }
//            }
//        }
//    }
//
//
//    fun loadData() {
//        viewModelScope.launch {
//
//            val jobs = listOf(
//
//                async {
//                    if (_userNotifications.value == UserNotificationResponse.Initial) {
//                        getUserNotifications()
//                    }
//                }
//            )
//            jobs.awaitAll()
//
//        }
//    }
//
//
//    fun getLocationDetails(context: Context, latitude: Double, longitude: Double): List<String> {
//        return try {
//            val geocoder = Geocoder(context, Locale.getDefault())
//
//            @Suppress("DEPRECATION")
//            val addresses = geocoder.getFromLocation(latitude, longitude, 1)
//
//            if (addresses?.isNotEmpty() == true) {
//                val address = addresses[0]
//                listOf(
//                    address.subLocality ?: address.locality ?: "", // Area/District
//                    address.locality ?: "", // City
//                    address.countryName ?: "" // Country
//                ).filter { it.isNotEmpty() }
//            } else {
//                emptyList()
//            }
//        } catch (_: kotlin.Exception) {
//            emptyList()
//        }
//    }
//}
//
//class MainActivity : ComponentActivity() {
//    private lateinit var fusedLocationClient: FusedLocationProviderClient
//    private lateinit var appViewModel: com.ranamahadahmer.ringnet.view_models.AppViewModel
//    private lateinit var authViewModel: AuthViewModel
//
//
//    private val requiredPermissions = arrayOf(
//        Manifest.permission.ACCESS_FINE_LOCATION,
//        Manifest.permission.ACCESS_COARSE_LOCATION,
//        Manifest.permission.INTERNET,
//        Manifest.permission.ACCESS_NETWORK_STATE,
//        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU)
//            Manifest.permission.POST_NOTIFICATIONS else TODO(),
//        Manifest.permission.FOREGROUND_SERVICE,
//        Manifest.permission.WAKE_LOCK,
//    )
//
//
//    companion object {
//        private const val PERMISSIONS_REQUEST_CODE = 100
//    }
//
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        initializeApp()
//        setupLocation()
//        setupUI()
//        observeAuthState()
//    }
//
//
//    private fun initializeApp() {
//        enableEdgeToEdge()
//        authViewModel = AuthViewModel(this)
//        appViewModel = AppViewModel(authViewModel = authViewModel, context = this)
////        P2PModel(this)
//    }
//
//    private fun setupLocation() {
//        if (!checkPermissions()) {
//            requestPermissions()
//            return
//        }
//        initializeLocationClient()
//    }
//
//    private fun initializeLocationClient() {
//        if (!::fusedLocationClient.isInitialized) {
//            fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
//
//        }
//    }
//
//    private fun setupUI() {
//        setContent {
//            RingNetTheme {
//                RingNetApp(authViewModel, appViewModel)
//            }
//        }
//    }
//
//    internal fun observeAuthState() {
//        lifecycleScope.launch {
//
//
//            lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
//                authViewModel.isUserLoggedIn.collect { isLoggedIn ->
//                    if (isLoggedIn && checkPermissions()) {
//                        startLocationUpdates()
//                    }
//                }
//            }
//        }
//    }
//
//
//    private fun checkPermissions(): Boolean {
//        return requiredPermissions.all { permission ->
//            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
//        }
//    }
//
//    private fun requestPermissions() {
//        ActivityCompat.requestPermissions(
//            this,
//            requiredPermissions,
//            PERMISSIONS_REQUEST_CODE
//        )
//    }
//
//    override fun onRequestPermissionsResult(
//        requestCode: Int,
//        permissions: Array<String>,
//        grantResults: IntArray
//    ) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
//        when (requestCode) {
//            PERMISSIONS_REQUEST_CODE -> handlePermissionResult(grantResults)
//        }
//    }
//
//    private fun handlePermissionResult(grantResults: IntArray) {
//        if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
//            initializeLocationClient()
//        } else {
//            showPermissionDeniedDialog()
//        }
//    }
//
//    private fun showPermissionDeniedDialog() {
//        AlertDialog.Builder(this)
//            .setTitle("Permissions Required")
//            .setMessage("This app requires location and internet permissions to function. The app will now close.")
//            .setPositiveButton("OK") { _, _ -> finish() }
//            .setCancelable(false)
//            .show()
//    }
//
//    // Location updates
//    @SuppressLint("MissingPermission")
//    private fun startLocationUpdates() {
//        try {
//            initializeLocationClient()
//
//            appViewModel.startLocationMonitoring(authViewModel.isUserLoggedIn.value) {
//                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
//                    location?.let { appViewModel.updateLocation(it) }
//                }
//            }
//
//        } catch (e: kotlin.Exception) {
//            e.printStackTrace()
//        }
//    }
//
//}
//
//
//class AuthViewModel(context: Context) : ViewModel() {
//
//    init {
//
//        viewModelScope.launch(Dispatchers.IO) {
//            val savedToken = dataStoreManager.token.first()
//            val savedUserId = dataStoreManager.userId.first()
//
//            withContext(Dispatchers.Main) {
//                _token.value = savedToken.orEmpty()
//                _userId.value = savedUserId.orEmpty()
//
//                _isUserLoggedIn.value = !savedToken.isNullOrEmpty() && !savedUserId.isNullOrEmpty()
//            }
//        }
//
//    }
//
//
//    fun saveUser() {
//        viewModelScope.launch {
//            if (_signInResponse.value is AuthResponse.Success) {
//                _token.value = (_signInResponse.value as AuthResponse.Success).token
//                _userId.value = (_signInResponse.value as AuthResponse.Success).userId
//                _isUserLoggedIn.value = true
//                dataStoreManager.insertData(
//                    mapOf(
//                        "token" to (_signInResponse.value as AuthResponse.Success).token,
//                        "userId" to (_signInResponse.value as AuthResponse.Success).userId
//                    )
//                )
//            }
//        }
//    }
//
//
//    fun signIn() {
//
//
//        viewModelScope.launch {
//            _signInResponse.value = AuthResponse.Loading
//            try {
//                val request = SignInRequestBody(_email.value, _passwordOne.value)
//                val result = withContext(Dispatchers.IO) { _signInApiService.signIn(request) }
//                _signInResponse.value =
//                    AuthResponse.Success(result.message, result.token, result.userId)
//
//
//            } catch (e: kotlin.Exception) {
//                _signInResponse.value = AuthResponse.Error(e.message ?: "An error occurred")
//
//            }
//        }
//    }
//
//
//    fun signUp() {
//        viewModelScope.launch {
//            _signUpResponse.value = AuthResponse.Loading
//            try {
//                val request = SignUpRequestBody(
//                    name = name.value,
//                    email = email.value,
//                    password = passwordOne.value
//                )
//                val result = withContext(Dispatchers.IO) { _signUpApiService.signUp(request) }
//                _signUpResponse.value =
//                    AuthResponse.Success(result.message, result.token, result.userId)
//                dataStoreManager.insertData(
//                    mapOf(
//                        "token" to (_signUpResponse.value as AuthResponse.Success).token,
//                        "userId" to (_signUpResponse.value as AuthResponse.Success).userId
//                    )
//                )
//            } catch (e: kotlin.Exception) {
//                _signUpResponse.value = AuthResponse.Error(e.message ?: "An error occurred")
//            }
//        }
//    }
//}
//
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

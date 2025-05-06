package com.ranamahadahmer.ringnet.view_models


import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.location.Geocoder
import android.location.Location
import android.os.IBinder
import android.util.Patterns
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.pager.PagerState
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.maps.model.LatLng
import com.ranamahadahmer.ringnet.api.BackendApi
import com.ranamahadahmer.ringnet.api.DeleteUserNotificationService
import com.ranamahadahmer.ringnet.api.EmergencyContactsService
import com.ranamahadahmer.ringnet.api.ProfileService
import com.ranamahadahmer.ringnet.api.ReadUserNotificationService
import com.ranamahadahmer.ringnet.api.StatsInfoService
import com.ranamahadahmer.ringnet.api.UpdateLocationService
import com.ranamahadahmer.ringnet.api.UserAlertsService
import com.ranamahadahmer.ringnet.api.UserNotificationService
import com.ranamahadahmer.ringnet.api.WeatherForecastService
import com.ranamahadahmer.ringnet.models.EmergencyContactsResponse
import com.ranamahadahmer.ringnet.models.LocationCoordinates
import com.ranamahadahmer.ringnet.models.LocationUpdateRequest
import com.ranamahadahmer.ringnet.models.NotificationInfo
import com.ranamahadahmer.ringnet.models.ProfileData
import com.ranamahadahmer.ringnet.models.ProfileResponse
import com.ranamahadahmer.ringnet.models.StatsInfoResponse
import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import com.ranamahadahmer.ringnet.models.UserNotificationResponse
import com.ranamahadahmer.ringnet.models.WeatherForecastResponse
import com.ranamahadahmer.ringnet.services.NotificationService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.SocketTimeoutException
import java.util.Locale
import java.util.concurrent.TimeUnit

class AppViewModel(
    val authViewModel: AuthViewModel,
    val context: Context
) : ViewModel() {

    companion object {
        private const val MAX_RETRIES = 3
        private const val RETRY_DELAY_MS = 1000L
    }

    var mainBottomBarState = MutableStateFlow(PagerState(pageCount = { 5 }, currentPage = 0))
    var notificationsPagerState = MutableStateFlow(PagerState(pageCount = { 3 }, currentPage = 0))
    var hazardMonitorPagerState = MutableStateFlow(PagerState(pageCount = { 2 }, currentPage = 0))
    val dashboardScrollState = ScrollState(0)

    private var locationMonitoringJob: Job? = null
    val alertTypes = setOf<String>("Earthquake", "Flood", "Tsunami", "Heatwave")
    private val _modifiedNotifications = MutableStateFlow<Set<String>>(emptySet())

    private val _emergencyContactsService: EmergencyContactsService =
        BackendApi.retrofit.create(EmergencyContactsService::class.java)
    private val _userAlertsService: UserAlertsService =
        BackendApi.retrofit.create(UserAlertsService::class.java)
    private val _weatherForecastService: WeatherForecastService =
        BackendApi.retrofit.create(WeatherForecastService::class.java)
    private val _statsInfoService: StatsInfoService =
        BackendApi.retrofit.create(StatsInfoService::class.java)
    private val _updateLocationService: UpdateLocationService =
        BackendApi.retrofit.create(UpdateLocationService::class.java)
    private val _userNotificationService: UserNotificationService =
        BackendApi.retrofit.create(UserNotificationService::class.java)
    private val _profileService: ProfileService =
        BackendApi.retrofit.create(ProfileService::class.java)
    private val _readUserNotificationService: ReadUserNotificationService =
        BackendApi.retrofit.create(ReadUserNotificationService::class.java)
    private val _deleteUserNotificationService: DeleteUserNotificationService =
        BackendApi.retrofit.create(DeleteUserNotificationService::class.java)


    private val _emergencyContacts =
        MutableStateFlow<EmergencyContactsResponse>(EmergencyContactsResponse.Initial)
    private val _weatherForecast =
        MutableStateFlow<WeatherForecastResponse>(WeatherForecastResponse.Initial)
    private val _statsInfo = MutableStateFlow<StatsInfoResponse>(StatsInfoResponse.Initial)
    private val _currentLocation = MutableStateFlow<LatLng?>(null)
    private val _userNotifications =
        MutableStateFlow<UserNotificationResponse>(UserNotificationResponse.Initial)
    private val _profile = MutableStateFlow<ProfileResponse>(ProfileResponse.Initial)
    private val _isEditingProfile = MutableStateFlow<Boolean>(false)
    private val _name = MutableStateFlow<String>("")
    private val _email = MutableStateFlow<String>("")
    private val _phone = MutableStateFlow<String>("")
    private val _selectedAlerts = MutableStateFlow<List<String>>(
        emptyList()
    )
    private val _showAlertDialog = MutableStateFlow<Boolean>(false)
    private val _snackbarMessage = MutableStateFlow<String?>(null)
    private val _hazardAlerts = MutableStateFlow<UserAlertsResponse>(UserAlertsResponse.Initial)
    private val _locationDetails = MutableStateFlow<List<String>>(emptyList())


    val emergencyContacts: StateFlow<EmergencyContactsResponse> = _emergencyContacts
    val weatherForecast: StateFlow<WeatherForecastResponse> = _weatherForecast
    val statsInfo: StateFlow<StatsInfoResponse> = _statsInfo
    val currentLocation: StateFlow<LatLng?> = _currentLocation
    val userNotifications: StateFlow<UserNotificationResponse> = _userNotifications
    val profile: StateFlow<ProfileResponse> = _profile
    val isEditingProfile: StateFlow<Boolean> = _isEditingProfile

    val name: StateFlow<String> = _name
    val email: StateFlow<String> = _email

    val phone: StateFlow<String> = _phone

    val selectedAlerts: StateFlow<List<String>> = _selectedAlerts
    val showAlertDialog: StateFlow<Boolean> = _showAlertDialog
    val snackbarMessage: StateFlow<String?> = _snackbarMessage
    val locationDetails: StateFlow<List<String>> = _locationDetails
    val hazardAlert: StateFlow<UserAlertsResponse> = _hazardAlerts


    fun setSelectedAlertClickRow(alert: String) {
        _selectedAlerts.value = if (_selectedAlerts.value.contains(alert)) {
            _selectedAlerts.value - alert
        } else {
            _selectedAlerts.value + alert
        }
    }

    fun setSelectedAlertClickBox(checked: Boolean, alert: String) {
        _selectedAlerts.value = if (checked) {
            _selectedAlerts.value + alert
        } else {
            _selectedAlerts.value - alert
        }
    }


    fun setShowAlertDialog(show: Boolean) {
        _showAlertDialog.value = show
    }


    fun setEditingProfile(isEditing: Boolean) {
        _isEditingProfile.value = isEditing
    }

    fun setName(name: String) {
        _name.value = name
    }

    fun setEmail(email: String) {
        _email.value = email
    }

    fun setPhone(phone: String) {
        _phone.value = phone
    }


    fun showSnackbar(message: String) {
        _snackbarMessage.value = message
        viewModelScope.launch {
            delay(1000)
            _snackbarMessage.value = null
        }
    }


    fun setMainPage(page: Int) {
        viewModelScope.launch {
            mainBottomBarState.value.scrollToPage(page)
        }
    }

    fun setNotificationsTab(page: Int) {
        viewModelScope.launch {
            notificationsPagerState.value.scrollToPage(page)
        }
    }


    fun deleteNotification(notification: NotificationInfo) {
        viewModelScope.launch {
            // Add to modified set
            _modifiedNotifications.value = _modifiedNotifications.value + notification.id

            try {
                _deleteUserNotificationService.deleteNotification(
                    token = "Bearer ${authViewModel.token.value}",
                    notificationId = notification.id
                )

                val updatedNotifications =
                    (_userNotifications.value as UserNotificationResponse.Success).notifications.filter {
                        it != notification
                    }
                _userNotifications.value =
                    (_userNotifications.value as UserNotificationResponse.Success).copy(
                        notifications = updatedNotifications
                    )

                // Remove from modified set after successful deletion
                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
            } catch (e: Exception) {
                // Handle error
                showSnackbar("Failed to delete notification")
                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
            }
        }
    }


    fun changeNotificationReadStatus(notification: NotificationInfo, status: String) {
        viewModelScope.launch {
            // Add to modified set
            _modifiedNotifications.value = _modifiedNotifications.value + notification.id

            try {
                if (status == "Read") {
                    _readUserNotificationService.readNotification(
                        token = "Bearer ${authViewModel.token.value}",
                        notificationId = notification.id
                    )
                }

                val updatedNotifications =
                    (_userNotifications.value as UserNotificationResponse.Success).notifications.map {
                        if (it == notification) it.copy(status = status) else it
                    }
                _userNotifications.value =
                    (_userNotifications.value as UserNotificationResponse.Success).copy(
                        notifications = updatedNotifications
                    )

                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
            } catch (e: Exception) {
                // Handle error
                _modifiedNotifications.value = _modifiedNotifications.value - notification.id
            }
        }
    }

    fun syncNotificationsWithService() {
        viewModelScope.launch {
            val serviceConnection = object : ServiceConnection {
                override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
                    // Service connected, we can now interact with it
                    val notificationService =
                        (service as NotificationService.LocalBinder).getService()

                    viewModelScope.launch {
                        notificationService.userNotifications.collect { serviceResponse ->
                            if (serviceResponse is UserNotificationResponse.Success &&
                                _userNotifications.value is UserNotificationResponse.Success
                            ) {

                                // Update our notifications with any read status changes from the service
                                val ourNotifications =
                                    (_userNotifications.value as UserNotificationResponse.Success).notifications
                                val serviceNotifications = serviceResponse.notifications

                                val updatedNotifications = ourNotifications.map { ourNotification ->
                                    val serviceNotification =
                                        serviceNotifications.find { it.id == ourNotification.id }
                                    if (serviceNotification != null && serviceNotification.status != ourNotification.status) {
                                        ourNotification.copy(status = serviceNotification.status)
                                    } else {
                                        ourNotification
                                    }
                                }

                                if (updatedNotifications != ourNotifications) {
                                    _userNotifications.value =
                                        (_userNotifications.value as UserNotificationResponse.Success).copy(
                                            notifications = updatedNotifications
                                        )
                                }
                            }
                        }
                    }
                }

                override fun onServiceDisconnected(name: ComponentName?) {
                    // Service disconnected
                }
            }

            context.bindService(
                Intent(context, NotificationService::class.java),
                serviceConnection,
                Context.BIND_AUTO_CREATE
            )
        }
    }

    fun setHazardTab(page: Int) {
        viewModelScope.launch {
            hazardMonitorPagerState.value.scrollToPage(page)
        }
    }


    fun updateLocation(location: Location) {
        _currentLocation.value = LatLng(location.latitude, location.longitude)
    }


    fun startLocationMonitoring(isAuthenticated: Boolean, getLocation: () -> Unit) {
        if (!isAuthenticated) {
            locationMonitoringJob?.cancel()
            return
        }

        locationMonitoringJob = viewModelScope.launch {
            while (true) {
                getLocation()
                if (_currentLocation.value == null) {
                    delay(
                        TimeUnit.SECONDS.toMillis(
                            1
                        )
                    )
                    continue
                }
                viewModelScope.launch {
                    val response = withContext(Dispatchers.IO) {
                        _updateLocationService.updateLocation(
                            token = "Bearer ${authViewModel.token.value}",
                            location = LocationUpdateRequest(
                                location = LocationCoordinates(
                                    latitude = _currentLocation.value!!.latitude,
                                    longitude = _currentLocation.value!!.longitude
                                )
                            )
                        )
                    }
                    if (response.message == "Location updated successfully") {
                        println("Location Updated successfully")
                    } else {
                        println("Failed to update location: ${response.message}")
                        delay(
                            TimeUnit.SECONDS.toMillis(
                                2
                            )
                        )
                        return@launch
                    }
                }
                loadData()
                _locationDetails.value = getLocationDetails(
                    context,
                    _currentLocation.value!!.latitude,
                    _currentLocation.value!!.longitude
                )
                delay(
                    TimeUnit.MINUTES.toMillis(
                        5
                    )
                )
            }
        }
    }


    override fun onCleared() {
        super.onCleared()

        locationMonitoringJob?.cancel()

    }


    fun getEmergencyContacts() {
        viewModelScope.launch {
            _emergencyContacts.value = EmergencyContactsResponse.Loading
            repeat(MAX_RETRIES) { attempt ->
                try {

                    val result = withContext(Dispatchers.IO) {
                        _emergencyContactsService.getContacts(
                            token = "Bearer ${authViewModel.token.value}",

                            )
                    }
                    _emergencyContacts.value = EmergencyContactsResponse.Success(result)

                    return@launch
                } catch (e: Exception) {
                    if (attempt == MAX_RETRIES - 1) {
                        val errorMessage = when (e) {
                            is SocketTimeoutException -> "Connection timed out. Please check your internet connection."
                            else -> e.message ?: "An unknown error occurred"
                        }
                        _emergencyContacts.value = EmergencyContactsResponse.Error(errorMessage)

                    } else {
                        delay(RETRY_DELAY_MS)
                    }
                }
            }
        }
    }


    fun getStatsInfo() {
        viewModelScope.launch {
            _statsInfo.value = StatsInfoResponse.Loading
            repeat(MAX_RETRIES) { attempt ->
                try {
                    val result = withContext(Dispatchers.IO) {
                        _statsInfoService.getStatsInfo(
                            token = "Bearer ${authViewModel.token.value}",
                        )
                    }
                    _statsInfo.value = StatsInfoResponse.Success(
                        stats = result.stats,
                        location = result.location
                    )

                    return@launch
                } catch (e: Exception) {
                    if (attempt == MAX_RETRIES - 1) {
                        _statsInfo.value =
                            StatsInfoResponse.Error(e.message ?: "An unknown error occurred")

                    } else {
                        delay(RETRY_DELAY_MS)
                    }
                }
            }
        }
    }


    fun getUserNotifications() {
        viewModelScope.launch {
            while (true) {
                if (_userNotifications.value == UserNotificationResponse.Initial) {
                    _userNotifications.value = UserNotificationResponse.Loading
                }

                repeat(MAX_RETRIES) { attempt ->
                    try {
                        val result = withContext(Dispatchers.IO) {
                            _userNotificationService.getNotifications(
                                token = "Bearer ${authViewModel.token.value}",
                            )
                        }
                        when (_userNotifications.value) {
                            is UserNotificationResponse.Success -> {
                                // Filter out notifications that are being modified
                                val filteredNotifications =
                                    result.notifications.filter { notification ->
                                        !_modifiedNotifications.value.contains(notification.id)
                                    }

                                // Combine with current notifications that are being modified
                                val currentNotifications =
                                    (_userNotifications.value as UserNotificationResponse.Success).notifications
                                val modifiedCurrentNotifications =
                                    currentNotifications.filter { notification ->
                                        _modifiedNotifications.value.contains(notification.id)
                                    }

                                val updatedNotifications =
                                    filteredNotifications + modifiedCurrentNotifications

                                if (updatedNotifications != currentNotifications) {
                                    _userNotifications.value =
                                        result.copy(notifications = updatedNotifications)
                                }
                            }

                            is UserNotificationResponse.Loading -> {
                                _userNotifications.value = result
                            }

                            else -> {}
                        }
                        delay(1000)
                    } catch (e: Exception) {
                        if (attempt == MAX_RETRIES - 1) {
                            _userNotifications.value = UserNotificationResponse.Error(
                                e.message ?: "An unknown error occurred"
                            )
                        } else {
                            delay(RETRY_DELAY_MS)
                        }
                    }
                }
            }
        }
    }

    fun getUserAlerts() {
        viewModelScope.launch {
            while (true) {
                if (_hazardAlerts.value == UserAlertsResponse.Initial) {
                    _hazardAlerts.value = UserAlertsResponse.Loading
                }

                repeat(MAX_RETRIES) { attempt ->
                    try {
                        val result = withContext(Dispatchers.IO) {
                            _userAlertsService.getAlerts(
                                token = "Bearer ${authViewModel.token.value}"
                            )
                        }

                        when (_hazardAlerts.value) {
                            is UserAlertsResponse.Success -> {

                                if (
                                    result.alerts != (_hazardAlerts.value as UserAlertsResponse.Success).alerts
                                ) {
                                    _hazardAlerts.value = result
                                }
                            }

                            is UserAlertsResponse.Loading -> {
                                _hazardAlerts.value = result
                            }

                            else -> {}

                        }
                        delay(1000)

                    } catch (e: Exception) {
                        if (attempt == MAX_RETRIES - 1) {
                            val errorMessage = when (e) {
                                is SocketTimeoutException -> "Connection timed out. Please check your internet connection."
                                else -> e.message ?: "An unknown error occurred"
                            }
                            _hazardAlerts.value = UserAlertsResponse.Error(errorMessage)

                        } else {
                            delay(RETRY_DELAY_MS)
                        }
                    }
                }
            }
        }
    }


    fun getProfile() {
        viewModelScope.launch {
            _profile.value = ProfileResponse.Loading
            try {
                val result = withContext(Dispatchers.Default) {
                    _profileService.getProfile(
                        token = "Bearer ${authViewModel.token.value}"
                    )
                }
                _profile.value = result

                _selectedAlerts.value = (_profile.value as ProfileResponse.Success).alertPreferences

                setName((_profile.value as ProfileResponse.Success).name)
                setEmail((_profile.value as ProfileResponse.Success).email)
                setPhone((_profile.value as ProfileResponse.Success).phone ?: "")


            } catch (e: Exception) {
                _profile.value = ProfileResponse.Error(e.message ?: "Failed to load profile")
            }
        }
    }


    fun verifyUpdates() {
        _isEditingProfile.value = false
        viewModelScope.launch {
            if (_name.value.isEmpty()) {
                showSnackbar("Name cannot be empty")
                getProfile()
                return@launch
            }

            if (_email.value.isEmpty() || !Patterns.EMAIL_ADDRESS.matcher(_email.value).matches()) {
                showSnackbar("Invalid email format")
                getProfile()
                return@launch
            }

            try {
                val currentProfile = (_profile.value as? ProfileResponse.Success)
                if (currentProfile != null) {
                    updateProfile(
                        ProfileData(
                            id = currentProfile.id,
                            name = _name.value,
                            email = _email.value,
                            phone = _phone.value,
                            description = currentProfile.description,
                            locationString = currentProfile.locationString,
                            alertPreferences = _selectedAlerts.value,
                            location = currentProfile.location,
                            createdAt = currentProfile.createdAt,
                            updatedAt = currentProfile.updatedAt,
                            v = currentProfile.v
                        )
                    )

                    _profile.value = ProfileResponse.Loading
                    showSnackbar("Profile updated successfully")
                    delay(3000)
                    getProfile()
                }
            } catch (e: Exception) {
                _profile.value = ProfileResponse.Loading
                showSnackbar(e.message ?: "Failed to update profile")
                delay(3000)
                getProfile()
            }
        }
    }

    fun updateProfile(request: ProfileData) {
        viewModelScope.launch {
            try {
                val result = withContext(Dispatchers.IO) {
                    _profileService.updateProfile(
                        token = "Bearer ${authViewModel.token.value}",
                        request = request
                    )
                }
                _profile.value = result
            } catch (_: Exception) {

            }
        }
    }

    fun loadData() {
        viewModelScope.launch {

            val jobs = listOf(
                async { getEmergencyContacts() },
                async { getStatsInfo() },
                async {
                    if (_hazardAlerts.value == UserAlertsResponse.Initial) {
                        getUserAlerts()
                    }
                },
                async {
                    if (_userNotifications.value == UserNotificationResponse.Initial) {
                        getUserNotifications()
                    }
                },
                async { getWeatherForecast() },
                async { getProfile() },
            )
            jobs.awaitAll()

        }
    }


    fun getLocationDetails(context: Context, latitude: Double, longitude: Double): List<String> {
        return try {
            val geocoder = Geocoder(context, Locale.getDefault())

            @Suppress("DEPRECATION")
            val addresses = geocoder.getFromLocation(latitude, longitude, 1)

            if (addresses?.isNotEmpty() == true) {
                val address = addresses[0]
                listOf(
                    address.subLocality ?: address.locality ?: "", // Area/District
                    address.locality ?: "", // City
                    address.countryName ?: "" // Country
                ).filter { it.isNotEmpty() }
            } else {
                emptyList()
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun getWeatherForecast() {
        viewModelScope.launch {
            _weatherForecast.value = WeatherForecastResponse.Loading
            repeat(MAX_RETRIES) { attempt ->
                try {
                    val result = withContext(Dispatchers.IO) {
                        _weatherForecastService.getWeatherForecast(
                            token = "Bearer ${authViewModel.token.value}",
                        )
                    }
                    _weatherForecast.value = result

                    return@launch
                } catch (e: Exception) {
                    if (attempt == MAX_RETRIES - 1) {
                        _weatherForecast.value =
                            WeatherForecastResponse.Error(e.message ?: "An unknown error occurred")
                    } else {
                        delay(RETRY_DELAY_MS)
                    }
                }
            }
        }
    }
}



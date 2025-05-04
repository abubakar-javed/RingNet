package com.ranamahadahmer.ringnet.view_models


import android.location.Location
import androidx.lifecycle.ViewModel
import com.ranamahadahmer.ringnet.views.dashboard.notifications.Notification
import kotlinx.coroutines.flow.MutableStateFlow
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.pager.PagerState
import androidx.lifecycle.viewModelScope
import com.google.android.gms.maps.model.LatLng
import com.ranamahadahmer.ringnet.api.BackendApi
import com.ranamahadahmer.ringnet.api.EmergencyContactsService
import com.ranamahadahmer.ringnet.api.unused.FloodDataService
import com.ranamahadahmer.ringnet.api.StatsInfoService
import com.ranamahadahmer.ringnet.api.unused.TsunamiAlertService
import com.ranamahadahmer.ringnet.api.UpdateLocationService
import com.ranamahadahmer.ringnet.api.UserAlertsService
import com.ranamahadahmer.ringnet.api.unused.WeatherForecastService
import com.ranamahadahmer.ringnet.models.EmergencyContactsResponse
import com.ranamahadahmer.ringnet.models.HazardAlertInfo
import com.ranamahadahmer.ringnet.models.unused.FloodDataResponse
import com.ranamahadahmer.ringnet.models.LocationCoordinates
import com.ranamahadahmer.ringnet.models.LocationUpdateRequest
import com.ranamahadahmer.ringnet.models.StatsInfoResponse
import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import com.ranamahadahmer.ringnet.models.unused.TsunamiAlertResponse
import com.ranamahadahmer.ringnet.models.unused.WeatherForecastResponse


import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.delay

import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

import java.util.concurrent.TimeUnit

class AppViewModel(val authViewModel: AuthViewModel) : ViewModel() {
    var mainBottomBarState = MutableStateFlow(PagerState(pageCount = { 5 }, currentPage = 0))
    var notificationsPagerState = MutableStateFlow(PagerState(pageCount = { 3 }, currentPage = 0))
    var hazardMonitorPagerState = MutableStateFlow(PagerState(pageCount = { 2 }, currentPage = 0))
    val dashboardScrollState = ScrollState(0)

    private val _currentLocation = MutableStateFlow<LatLng?>(null)
    val currentLocation: StateFlow<LatLng?> = _currentLocation
    private var locationMonitoringJob: Job? = null

    companion object {
        private const val TIMEOUT_SECONDS = 30L
        private const val MAX_RETRIES = 3
        private const val RETRY_DELAY_MS = 1000L
    }


    private val _emergencyContactsService: EmergencyContactsService =
        BackendApi.retrofit.create(EmergencyContactsService::class.java)
    private val _floodDataService: FloodDataService =
        BackendApi.retrofit.create(FloodDataService::class.java)
    private val _tsunamiAlertService: TsunamiAlertService =
        BackendApi.retrofit.create(TsunamiAlertService::class.java)
    private val _weatherForecastService: WeatherForecastService =
        BackendApi.retrofit.create(WeatherForecastService::class.java)
    private val _statsInfoService: StatsInfoService =
        BackendApi.retrofit.create(StatsInfoService::class.java)
    private val _emergencyContacts =
        MutableStateFlow<EmergencyContactsResponse>(EmergencyContactsResponse.Initial)
    private val _floodData = MutableStateFlow<FloodDataResponse>(FloodDataResponse.Initial)
    private val _tsunamiAlert = MutableStateFlow<TsunamiAlertResponse>(TsunamiAlertResponse.Initial)
    private val _weatherForecast =
        MutableStateFlow<WeatherForecastResponse>(WeatherForecastResponse.Initial)
    private val _statsInfo = MutableStateFlow<StatsInfoResponse>(StatsInfoResponse.Initial)
    val emergencyContacts: StateFlow<EmergencyContactsResponse> = _emergencyContacts
    val floodData: StateFlow<FloodDataResponse> = _floodData
    val tsunamiAlert: StateFlow<TsunamiAlertResponse> = _tsunamiAlert
    val weatherForecast: StateFlow<WeatherForecastResponse> = _weatherForecast

    val statsInfo: StateFlow<StatsInfoResponse> = _statsInfo


    private val _updateLocationService: UpdateLocationService =
        BackendApi.retrofit.create(UpdateLocationService::class.java)

    private val _notifications = MutableStateFlow(
        emptyList<Notification>(
//            Notification(
//                "Earthquake Alert",
//                "Magnitude 6.2 earthquake detected in Nepal region",
//                "3/20/2024, 3:30:00 PM",
//                "HIGH",
//                Icons.Default.Public, // Use appropriate icon
//                false
//            ),
//            Notification(
//                "Tsunami Warning",
//                "Potential tsunami threat detected in Indonesian waters",
//                "3/20/2024, 2:15:00 PM",
//                "HIGH",
//                Icons.Default.Waves,
//                true
//            ),
//            Notification(
//                "Flood Alert",
//                "Rising water levels in Bangladesh coastal areas",
//                "3/20/2024, 4:45:00 AM",
//                "MEDIUM",
//                Icons.Default.Flood, // Use appropriate icon
//                false
//            )
        )
    )
    val notifications: StateFlow<List<Notification>> = _notifications


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


    fun changeNotificationReadStatus(notification: Notification) {
        val updatedNotifications = _notifications.value.map {
            if (it == notification) it.copy(isRead = !it.isRead) else it
        }
        _notifications.value = updatedNotifications
    }

    fun deleteNotification(notification: Notification) {
        val updatedNotifications = _notifications.value.filter { it != notification }
        _notifications.value = updatedNotifications
    }


    //    private val _hazardAlerts = MutableStateFlow(
//        listOf<HazardAlertInfo>(
//            HazardAlertInfo(
//
//                detail = "Magnitude 6.2 earthquake detected",
//                location = "Nepal, Kathmandu",
//                severity = "HIGH",
//                type = "Earthquake",
//                timestamp = "3/15/2024, 1:30:00 PM",
//
//                ),
//            HazardAlertInfo(
//
//                severity = "HIGH",
//                detail = "Potential tsunami threat detected",
//                type = "Tsunami",
//                timestamp = "3/14/2024, 8:45:00 PM",
//                location = "Indonesia, Jakarta",
//            )
//
//
//        )
//    )
    private val _hazardAlerts = MutableStateFlow<UserAlertsResponse>(UserAlertsResponse.Initial)
    val hazardAlert: StateFlow<UserAlertsResponse> = _hazardAlerts

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
                            is java.net.SocketTimeoutException -> "Connection timed out. Please check your internet connection."
                            else -> e.message ?: "An unknown error occurred"
                        }
                        _emergencyContacts.value = EmergencyContactsResponse.Error(errorMessage)
                        println("Error fetching emergency contacts: $errorMessage")
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
                    println("Stats Info Response: $result")
                    return@launch
                } catch (e: Exception) {
                    if (attempt == MAX_RETRIES - 1) {
                        _statsInfo.value =
                            StatsInfoResponse.Error(e.message ?: "An unknown error occurred")
                        println("Stats Info API error: ${e.message}")
                    } else {
                        delay(RETRY_DELAY_MS)
                    }
                }
            }
        }
    }

    // Add this property at the top of AppViewModel with other service declarations
    private val _userAlertsService: UserAlertsService =
        BackendApi.retrofit.create(UserAlertsService::class.java)

    fun getUserAlerts() {
        viewModelScope.launch {
            _hazardAlerts.value = UserAlertsResponse.Loading
            repeat(MAX_RETRIES) { attempt ->
                try {
                    val result = withContext(Dispatchers.IO) {
                        _userAlertsService.getAlerts(
                            token = "Bearer ${authViewModel.token.value}"
                        )
                    }
                    _hazardAlerts.value = result
                    println("User Alerts Response: $result")
                    return@launch
                } catch (e: Exception) {
                    if (attempt == MAX_RETRIES - 1) {
                        val errorMessage = when (e) {
                            is java.net.SocketTimeoutException -> "Connection timed out. Please check your internet connection."
                            else -> e.message ?: "An unknown error occurred"
                        }
                        _hazardAlerts.value = UserAlertsResponse.Error(errorMessage)
                        println("Error fetching user alerts: $errorMessage")
                    } else {
                        delay(RETRY_DELAY_MS)
                    }
                }
            }
        }
    }

    fun loadData() {
        viewModelScope.launch {

            val jobs = listOf(
                async { getEmergencyContacts() },
                async { getStatsInfo() },
                async { getUserAlerts() },

                )
            jobs.awaitAll()

        }
    }


}


//fun getFloodData() {
//    viewModelScope.launch {
//        _floodData.value = FloodDataResponse.Loading
//        repeat(MAX_RETRIES) { attempt ->
//            try {
//                val result = withContext(Dispatchers.IO) {
//                    _floodDataService.getFloodData(
//                        token = "Bearer ${authViewModel.token.value}",
//                    )
//                }
//                _floodData.value = result
//
//                return@launch
//            } catch (e: Exception) {
//                if (attempt == MAX_RETRIES - 1) {
//                    _floodData.value =
//                        FloodDataResponse.Error(e.message ?: "An unknown error occurred")
//                } else {
//                    delay(RETRY_DELAY_MS)
//                }
//            }
//        }
//    }
//}
//
//fun getTsunamiAlert() {
//    viewModelScope.launch {
//        _tsunamiAlert.value = TsunamiAlertResponse.Loading
//        repeat(MAX_RETRIES) { attempt ->
//            try {
//                val result = withContext(Dispatchers.IO) {
//                    _tsunamiAlertService.getTsunamiData(
//                        token = "Bearer ${authViewModel.token.value}",
//                    )
//                }
//                _tsunamiAlert.value = result
//
//                return@launch
//            } catch (e: Exception) {
//                if (attempt == MAX_RETRIES - 1) {
//                    _tsunamiAlert.value =
//                        TsunamiAlertResponse.Error(e.message ?: "An unknown error occurred")
//                } else {
//                    delay(RETRY_DELAY_MS)
//                }
//            }
//        }
//    }
//}
//
//fun getWeatherForecast() {
//    viewModelScope.launch {
//        _weatherForecast.value = WeatherForecastResponse.Loading
//        repeat(MAX_RETRIES) { attempt ->
//            try {
//                val result = withContext(Dispatchers.IO) {
//                    _weatherForecastService.getWeatherForecast(
//                        token = "Bearer ${authViewModel.token.value}",
//                    )
//                }
//                _weatherForecast.value = result
//                println(_weatherForecast.value)
//                return@launch
//            } catch (e: Exception) {
//                if (attempt == MAX_RETRIES - 1) {
//                    _weatherForecast.value =
//                        WeatherForecastResponse.Error(e.message ?: "An unknown error occurred")
//                } else {
//                    delay(RETRY_DELAY_MS)
//                }
//            }
//        }
//    }
//}
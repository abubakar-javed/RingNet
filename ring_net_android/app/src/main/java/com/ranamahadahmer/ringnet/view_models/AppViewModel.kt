package com.ranamahadahmer.ringnet.view_models

import androidx.lifecycle.ViewModel
import com.ranamahadahmer.ringnet.views.dashboard.notifications.Notification
import kotlinx.coroutines.flow.MutableStateFlow
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.pager.PagerState
import androidx.lifecycle.viewModelScope
import com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring.HazardAlertInfo

import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {
    var mainBottomBarState = MutableStateFlow(PagerState(pageCount = { 5 }, currentPage = 0))
    var notificationsPagerState = MutableStateFlow(PagerState(pageCount = { 3 }, currentPage = 0))
    var hazardMonitorPagerState = MutableStateFlow(PagerState(pageCount = { 2 }, currentPage = 0))
    val dashboardScrollState = ScrollState(0)


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


    private val _hazardAlerts = MutableStateFlow(
        emptyList<HazardAlertInfo>(
//            HazardAlertInfo(
//                title = "Earthquake Alert",
//                description = "Magnitude 6.2 earthquake detected",
//                location = "Nepal, Kathmandu",
//                severity = "HIGH",
//                type = "Earthquake",
//                time = "3/15/2024, 1:30:00 PM",
//
//                ),
//            HazardAlertInfo(
//                title = "Tsunami Alert",
//                severity = "HIGH",
//                description = "Potential tsunami threat detected",
//                type = "Tsunami",
//                time = "3/14/2024, 8:45:00 PM",
//                location = "Indonesia, Jakarta",
//            )


        )
    )

    val hazardAlert: StateFlow<List<HazardAlertInfo>> = _hazardAlerts

    fun setHazardTab(page: Int) {
        viewModelScope.launch {
            hazardMonitorPagerState.value.scrollToPage(page)
        }
    }
}
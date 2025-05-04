package com.ranamahadahmer.ringnet.views.dashboard.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.NotificationInfo
import com.ranamahadahmer.ringnet.models.ProfileResponse
import com.ranamahadahmer.ringnet.models.UserNotificationResponse

import com.ranamahadahmer.ringnet.views.dashboard.common.emptyDataPlaceholder
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations

@Composable
fun Notifications(viewModel: AppViewModel, modifier: Modifier) {
    val tabs = listOf("ALL", "UNREAD", "READ")
    val notifications = viewModel.userNotifications.collectAsState()
    val pagerState = viewModel.notificationsPagerState.collectAsState()

    Column(modifier = modifier) {
        TabRow(
            selectedTabIndex = pagerState.value.currentPage,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[pagerState.value.currentPage]),
                    color = Color(202, 23, 28, 255) // Change this color to your desired color
                )
            }) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = pagerState.value.currentPage == index,
                    selectedContentColor = Color(202, 23, 28, 255),
                    unselectedContentColor = Color.Gray,
                    onClick = { viewModel.setNotificationsTab(index) },
                    text = { Text(title, fontWeight = FontWeight.Bold) }
                )
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        HorizontalPager(
            state = pagerState.value
        ) { page ->
            when (page) {
                0 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 8.dp)
                    ) {
                        when (notifications.value) {
                            is UserNotificationResponse.Initial -> {

                            }

                            is UserNotificationResponse.Loading -> {
                                item {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator()
                                    }
                                }
                            }

                            is UserNotificationResponse.Error -> {
                                item {
                                    val data =
                                        (notifications.value as UserNotificationResponse.Error)
                                    Text(
                                        text = data.message,
                                        fontSize = 16.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }

                            is UserNotificationResponse.Success -> {
                                val data =
                                    (notifications.value as UserNotificationResponse.Success).notifications
                                if (data.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No Alerts for your Preference",
                                            fontSize = 16.sp,
                                            color = Color.Gray,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                }
                                items(data) { notification ->
                                    NotificationCard(
                                        notification,
                                        onReadToggle = {
                                            viewModel.changeNotificationReadStatus(
                                                notification
                                            )
                                        },
                                        onDelete = { viewModel.deleteNotification(notification) }

                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                }

                            }
                        }


                    }
                }

                1 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 8.dp)
                    ) {
                        when (notifications.value) {
                            is UserNotificationResponse.Initial -> {

                            }

                            is UserNotificationResponse.Loading -> {
                                item {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator()
                                    }
                                }
                            }

                            is UserNotificationResponse.Error -> {
                                item {
                                    val data =
                                        (notifications.value as UserNotificationResponse.Error)
                                    Text(
                                        text = data.message,
                                        fontSize = 16.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }

                            is UserNotificationResponse.Success -> {
                                val data =
                                    (notifications.value as UserNotificationResponse.Success).notifications
                                if (data.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No Alerts for your Preference",
                                            fontSize = 16.sp,
                                            color = Color.Gray,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                }
                                items(data) { notification ->
                                    if (notification.status != "Read") {
                                        NotificationCard(
                                            notification,
                                            onReadToggle = {
                                                viewModel.changeNotificationReadStatus(
                                                    notification
                                                )
                                            },
                                            onDelete = { viewModel.deleteNotification(notification) }

                                        )
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }
                                }

                            }
                        }

                    }

                }

                2 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 8.dp)
                    ) {

                        when (notifications.value) {
                            is UserNotificationResponse.Initial -> {

                            }

                            is UserNotificationResponse.Loading -> {
                                item {
                                    Box(
                                        modifier = Modifier.fillMaxSize(),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator()
                                    }
                                }
                            }

                            is UserNotificationResponse.Error -> {
                                item {
                                    val data =
                                        (notifications.value as UserNotificationResponse.Error)
                                    Text(
                                        text = data.message,
                                        fontSize = 16.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }

                            is UserNotificationResponse.Success -> {
                                val data =
                                    (notifications.value as UserNotificationResponse.Success).notifications
                                if (data.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No Alerts for your Preference",
                                            fontSize = 16.sp,
                                            color = Color.Gray,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                }
                                items(data) { notification ->
                                    if (notification.status == "Read") {
                                        NotificationCard(
                                            notification,
                                            onReadToggle = {
                                                viewModel.changeNotificationReadStatus(
                                                    notification
                                                )
                                            },
                                            onDelete = { viewModel.deleteNotification(notification) }

                                        )
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }
                                }

                            }
                        }

                    }
                }
            }
        }
    }
}

@Composable
fun NotificationCard(
    notification: NotificationInfo,
    onReadToggle: () -> Unit,
    onDelete: () -> Unit
) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.status != "Read") Color(0xFFFFEEEE)
            else Color(0xFAE3F2FD)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        HazardDecorations.hazardBgColors.getValue(notification.type),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = HazardDecorations.hazardIcons.getValue(notification.type),
                    contentDescription = null,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(notification.location, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    notification.message,
                    fontSize = 14.sp,
                    color = Color.Gray,

                    overflow = TextOverflow.Ellipsis
                )
                Text(notification.createdAt, fontSize = 12.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.width(8.dp))
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                SeverityBadge(notification.severity)
                if (notification.status != "Read") {
                    IconButton(
                        onClick = onReadToggle
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Mark as Read",
                            tint = Color.Red
                        )
                    }
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = Color.Gray
                    )
                }
//                Row {
//
//                }

            }
        }
    }
}

@Composable
fun SeverityBadge(severity: String) {

    Box(
        modifier = Modifier
            .background(
                color = Color(0xFFFFE5E5),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(

            HazardDecorations.hazardSeverityText.getValue(severity),
            color = HazardDecorations.hazardSeverityColor.getValue(severity),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )

    }
}

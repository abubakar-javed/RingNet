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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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

import com.ranamahadahmer.ringnet.views.dashboard.common.emptyDataPlaceholder
import com.ranamahadahmer.ringnet.view_models.AppViewModel

@Composable
fun Notifications(viewModel: AppViewModel, modifier: Modifier) {
    val tabs = listOf("ALL", "UNREAD", "READ")
    val notifications = viewModel.notifications.collectAsState()
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
                        if (notifications.value.isEmpty()) {
                            item { emptyDataPlaceholder() }
                        }
                        
                        items(notifications.value) { notification ->
                            NotificationCard(
                                notification,
                                onReadToggle = { viewModel.changeNotificationReadStatus(notification) },
                                onDelete = { viewModel.deleteNotification(notification) }

                            )
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }

                1 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 8.dp)
                    ) {
                        if (notifications.value.isEmpty()) {
                            item { emptyDataPlaceholder() }
                        }
                        items(notifications.value) { notification ->
                            if (notification.isRead == false) {
                                NotificationCard(
                                    notification,
                                    onReadToggle = {
                                        viewModel.changeNotificationReadStatus(notification)
                                    },
                                    onDelete = { viewModel.deleteNotification(notification) }

                                )
                                Spacer(modifier = Modifier.height(12.dp))
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
                        if (notifications.value.isEmpty()) {
                            item { emptyDataPlaceholder() }
                        }
                        items(notifications.value) { notification ->
                            if (notification.isRead == true) {
                                NotificationCard(
                                    notification,
                                    onReadToggle = { },
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

@Composable
fun NotificationCard(notification: Notification, onReadToggle: () -> Unit, onDelete: () -> Unit) {

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead == false) Color(0xFFFFEEEE)
            else Color(0xFAE3F2FD)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = notification.icon,
                contentDescription = null,
                tint = Color.Unspecified,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(notification.title, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(8.dp))

                }
                Text(
                    notification.description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(notification.timestamp, fontSize = 12.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.width(8.dp))
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                SeverityBadge(notification.severity)
                Row {
                    if (!notification.isRead) {
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
                }

            }
        }
    }
}

@Composable
fun SeverityBadge(severity: String) {
    val backgroundColor = when (severity) {
        "HIGH" -> Color(0xFFFFCDD2)
        "MEDIUM" -> Color(0xFFFFF9C4)
        else -> Color.LightGray
    }
    val textColor = when (severity) {
        "HIGH" -> Color.Red
        "MEDIUM" -> Color(0xFFFFA000)
        else -> Color.DarkGray
    }

    Box(
        modifier = Modifier
            .background(backgroundColor, shape = RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(severity, color = textColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}


data class Notification(
    val title: String,
    val description: String,
    val timestamp: String,
    val severity: String,
    val icon: ImageVector,
    var isRead: Boolean
)





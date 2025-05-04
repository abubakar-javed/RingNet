package com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring


import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.HazardAlertInfo
import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring.components.AlertCard


@Composable
fun HazardMonitor(viewModel: AppViewModel) {
    val tabs = listOf("Active Alerts", "Historical Data")
    val pagerState = viewModel.hazardMonitorPagerState.collectAsState()
    val hazardAlertInfo = viewModel.hazardAlert.collectAsState()

    Column(modifier = Modifier.padding(horizontal = 8.dp)) {
        TabRow(
            selectedTabIndex = pagerState.value.currentPage,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[pagerState.value.currentPage]),
                    color = Color(202, 23, 28, 255)
                )
            }) {
            tabs.forEachIndexed { index, title ->

                Tab(
                    selected = pagerState.value.currentPage == index,
                    selectedContentColor = Color(202, 23, 28, 255),
                    unselectedContentColor = Color.Gray,
                    onClick = { viewModel.setHazardTab(index) },
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

                        when (hazardAlertInfo.value) {
                            is UserAlertsResponse.Loading -> {
                                item {
                                    Text(
                                        text = "Loading Alerts...",
                                        fontSize = 16.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }

                            }

                            is UserAlertsResponse.Error -> {
                                item {
                                    Text(
                                        text = "Error Loading Alerts..",
                                        fontSize = 16.sp,
                                        color = Color.Gray,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }

                            is UserAlertsResponse.Success -> {
                                val alerts =
                                    (hazardAlertInfo.value as UserAlertsResponse.Success).alerts
                                if (alerts.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No Alerts found for your Location",
                                            fontSize = 16.sp,
                                            color = Color.Gray,
                                            modifier = Modifier.padding(16.dp)
                                        )
                                    }
                                } else {
                                    items(alerts) { alert ->
                                        AlertCard(alert)
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }

                                }
                            }

                            UserAlertsResponse.Initial -> TODO()
                        }

                    }
                }

                1 -> {

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 8.dp)
                    ) {
                        item {
                            Row {
                                TableHeader(
                                    "Type", Modifier
                                        .padding(4.dp)
                                        .weight(1.5f)
                                )
                                TableHeader(
                                    "Location", Modifier
                                        .padding(4.dp)
                                        .weight(2f)
                                )
                                TableHeader(
                                    "Date", Modifier
                                        .padding(4.dp)
                                        .weight(1.5f)
                                )


                            }
                            Spacer(modifier = Modifier.height(8.dp))
                        }

                    }

                }
            }
        }
    }
}


@Composable
fun TableHeader(text: String, modifier: Modifier) {
    Text(
        text,
        fontWeight = FontWeight.Bold,
        modifier = modifier
    )
}

@Composable
fun TableRow(hazard: HazardAlertInfo) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {

        Text(hazard.type, modifier = Modifier.weight(1.5f))

        Text(hazard.location.split(",")[0], modifier = Modifier.weight(2f))
        Text(hazard.timestamp.split(",")[0], modifier = Modifier.weight(1.5f))


    }
}


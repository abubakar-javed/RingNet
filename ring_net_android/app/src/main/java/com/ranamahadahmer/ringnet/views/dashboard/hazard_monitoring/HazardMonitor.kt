package com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring

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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
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
import com.ranamahadahmer.ringnet.view_models.AppViewModel

import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations
import com.ranamahadahmer.ringnet.views.dashboard.common.emptyDataPlaceholder


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
                        if (hazardAlertInfo.value.isEmpty()) {
                            item {
                                emptyDataPlaceholder()
                            }
                        }

                        items(hazardAlertInfo.value) { alert ->
                            AlertCard(alert)
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
                        if (hazardAlertInfo.value.isEmpty()) {
                            item {
                                emptyDataPlaceholder()
                            }
                        }
                        items(hazardAlertInfo.value) { alert ->
                            TableRow(alert)
                            HorizontalDivider(thickness = 1.dp)
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
        Text(hazard.time.split(",")[0], modifier = Modifier.weight(1.5f))


    }
}

@Composable
fun AlertCard(alert: HazardAlertInfo) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon inside Circle

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(HazardDecorations.hazardBgColors.getValue(alert.type), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = HazardDecorations.hazardIcons.getValue(alert.type),
                    contentDescription = null,
                    modifier = Modifier.size(24.dp)
                )
            }


            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        alert.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        alert.severity,
                        fontSize = 12.sp,
                        color = Color.Red,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .background(Color(0xFFFFE5E5), shape = RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Text(
                    alert.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Location: ${alert.location}",
                    fontSize = 12.sp,
                    color = Color.DarkGray
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Time: ${alert.time}",
                    fontSize = 12.sp,
                    color = Color.DarkGray
                )

            }
        }
    }
}

data class HazardAlertInfo(
    val title: String,
    val severity: String,
    val description: String,
    val type: String,
    val time: String,
    val location: String,

    )
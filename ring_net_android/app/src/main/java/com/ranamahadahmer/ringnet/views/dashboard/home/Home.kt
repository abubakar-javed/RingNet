package com.ranamahadahmer.ringnet.views.dashboard.home

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeviceThermostat
import androidx.compose.material.icons.filled.Flood
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Waves
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ranamahadahmer.ringnet.models.Stats
import com.ranamahadahmer.ringnet.models.StatsInfoResponse
import com.ranamahadahmer.ringnet.models.common.WarningCard
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.home.components.CurrentWarningCardRow
import com.ranamahadahmer.ringnet.views.dashboard.home.components.EmergencyContactsScreen
import com.ranamahadahmer.ringnet.views.dashboard.home.components.FiveDayWeatherForecasts
import com.ranamahadahmer.ringnet.views.dashboard.home.components.RecentAlerts


@Composable
fun Home(scrollState: ScrollState, appModel: AppViewModel) {
    val statsInfo = appModel.statsInfo.collectAsState().value

    // Extract stats data or use default values if not available
    val stats = when (statsInfo) {
        is StatsInfoResponse.Success -> statsInfo.stats
        else -> Stats(earthquakes = 0, tsunamis = 0, floods = 0, heatwaves = 0)
    }

    // Create cards with actual data
    val warningCards = listOf(
        WarningCard(
            title = "Earthquakes",
            number = stats.earthquakes,
            description = "Active seismic zones",
            icon = Icons.Default.Public
        ),
        WarningCard(
            title = "Tsunamis",
            number = stats.tsunamis,
            description = "Coastal warnings active",
            icon = Icons.Default.Waves
        ),
        WarningCard(
            title = "Floods",
            number = stats.floods,
            description = "Regions affected",
            icon = Icons.Default.Flood
        ),
        WarningCard(
            title = "Heatwaves",
            number = stats.heatwaves,
            description = "High temperature alerts",
            icon = Icons.Default.DeviceThermostat
        )
    )
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 8.dp)
    ) {
        LazyRow {
            items(warningCards) { item ->
                CurrentWarningCardRow(
                    modifier = Modifier
                        .padding(horizontal = 8.dp)
                        .height(120.dp)
                        .width(220.dp),
                    title = item.title,
                    icon = item.icon,
                    number = item.number,
                    description = item.description
                )
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        FiveDayWeatherForecasts(Modifier.padding(horizontal = 8.dp), viewModel = appModel)
        Spacer(modifier = Modifier.height(16.dp))
        RecentAlerts(Modifier.padding(horizontal = 8.dp), viewModel = appModel)
//        Spacer(modifier = Modifier.height(16.dp))
//        ActiveWeatherWarningsScreen(Modifier.padding(horizontal = 8.dp))
        Spacer(modifier = Modifier.height(16.dp))
        EmergencyContactsScreen(Modifier.padding(horizontal = 8.dp), appModel = appModel)

    }
}


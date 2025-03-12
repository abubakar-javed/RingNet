package com.ranamahadahmer.ringnet.views.dashboard.home

import android.os.Build
import androidx.annotation.RequiresApi
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.ranamahadahmer.ringnet.views.dashboard.home.components.ActiveWeatherWarningsScreen
import com.ranamahadahmer.ringnet.views.dashboard.home.components.CurrentWarningCardRow
import com.ranamahadahmer.ringnet.views.dashboard.home.components.FiveDayHazardForecasts
import com.ranamahadahmer.ringnet.views.dashboard.home.components.RecentAlerts


data class WarningCard(
    val title: String,
    val number: Int,
    val description: String,
    val icon: ImageVector,
)

val myCards = listOf(
    WarningCard("Earthquakes", 0, "Active seismic zones", Icons.Default.Public),
    WarningCard("Tsunamis", 0, "Coastal warnings active", Icons.Default.Waves),
    WarningCard("Floods", 0, "Regions affected", Icons.Default.Flood),
    WarningCard("Heatwaves", 0, "High temperature alerts", Icons.Default.DeviceThermostat),
)


@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun Home(scrollState: ScrollState) {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 8.dp)
    ) {
        LazyRow {
            items(myCards) { item ->
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
        FiveDayHazardForecasts(Modifier.padding(horizontal = 8.dp))
        Spacer(modifier = Modifier.height(16.dp))
        RecentAlerts(Modifier.padding(horizontal = 8.dp))
        Spacer(modifier = Modifier.height(16.dp))
        ActiveWeatherWarningsScreen(Modifier.padding(horizontal = 8.dp))
    }
}


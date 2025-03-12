package com.ranamahadahmer.ringnet.views.dashboard.home.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations


val alertList = emptyList<WeatherAlert>(
//    WeatherAlert(
//        title = "Heatwave expected",
//        description = "Temperatures exceeding 40°C expected",
//        region = "South Asia",
//        severity = "HIGH",
//
//        type = "Heatwave"
//    ),
//    WeatherAlert(
//        title = "Coastal flood warnings",
//        description = "High tide levels predicted",
//        region = "Southeast Asia",
//        severity = "MEDIUM",
//
//        type = "Flood"
//    ),
//    WeatherAlert(
//        title = "Seismic activity monitoring",
//        description = "Multiple aftershocks detected",
//        region = "Pacific region",
//        severity = "LOW",
//
//        type = "Earthquake"
//    )
)


@Composable
fun ActiveWeatherWarningsScreen(modifier: Modifier) {
    Column(
        modifier = modifier
    ) {


        Text(
            text = "Active Weather Warnings",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(12.dp))

        alertList.forEach { alert ->
            WeatherAlertCard(alert)
        }
        if (alertList.isEmpty()) {
            Text(
                text = "No active weather warnings",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun WeatherAlertCard(alert: WeatherAlert) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon inside a circular background
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(HazardDecorations.hazardBgColors.getValue(alert.type), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = HazardDecorations.hazardIcons.getValue(alert.type),
                    contentDescription = alert.title,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = alert.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(text = alert.description, fontSize = 14.sp, color = Color.Gray)
                Text(
                    text = "Region: ${alert.region}",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontStyle = FontStyle.Italic
                )
            }

            // Severity badge
            Box(
                modifier = Modifier
                    .background(
                        HazardDecorations.hazardSeverityColor.getValue(alert.severity)
                            .copy(alpha = 0.15f), RoundedCornerShape(8.dp)
                    )
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = alert.severity,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = HazardDecorations.hazardSeverityColor.getValue(alert.severity)
                )
            }
        }
    }
}

data class WeatherAlert(
    val title: String,
    val description: String,
    val region: String,
    val severity: String,
    val type: String
)


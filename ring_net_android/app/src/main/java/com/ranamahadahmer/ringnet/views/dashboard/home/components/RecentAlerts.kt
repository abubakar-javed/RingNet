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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations

val alerts = emptyList<Alert>(
//    Alert(
//        title = "Earthquake Alert",
//        location = "Nepal, Kathmandu",
//        danger = "High Risk",
//        id = "NORWE9",
//        type = "Earthquake",
//        timestamp = "Mar 15, 01:30 PM"
//    ),
//    Alert(
//        title = "Tsunami Alert",
//        location = "Indonesia, Jakarta",
//        danger = "Medium Risk",
//        id = "4CP96P",
//        type = "Tsunami",
//        timestamp = "Mar 14, 08:45 PM"
//    ),
//    Alert(
//        title = "Flood Alert",
//        location = "Bangladesh, Dhaka",
//        danger = "Medium Risk",
//        id = "SW8KFL",
//        type = "Flood",
//        timestamp = "Mar 14, 05:20 PM"
//    ),
//    Alert(
//        title = "Heatwave Alert",
//        location = "India, New Delhi",
//        danger = "Low Risk",
//        id = "DZ6QV0",
//        type = "Heatwave",
//        timestamp = "Mar 13, 02:15 PM"
//    )
)

@Composable
fun RecentAlerts(modifier: Modifier) {
    Column(modifier) {
        Text(
            text = "Recent Alerts",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,

            )
        Spacer(modifier = Modifier.height(8.dp))
        alerts.forEach { alert ->
            AlertCard(alert)
        }
        if (alerts.isEmpty()) {
            Text(
                text = "No alerts to show",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun AlertCard(alert: Alert) {
    Card(
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
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
                Text(text = alert.location, fontSize = 14.sp, color = Color.Gray)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Risk Level",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = alert.danger, fontSize = 12.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "ID: ${alert.id}", fontSize = 12.sp, color = Color.Gray)
                }
            }

            Text(text = alert.timestamp, fontSize = 12.sp, color = Color.Gray)
        }
    }
}

data class Alert(
    val title: String,
    val location: String,
    val type: String,
    val danger: String,
    val id: String,
    val timestamp: String
)




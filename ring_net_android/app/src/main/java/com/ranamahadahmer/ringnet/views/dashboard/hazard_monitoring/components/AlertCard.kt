package com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring.components

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.HazardAlertInfo
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations
import com.ranamahadahmer.ringnet.views.dashboard.common.formatDateTime

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
                        alert.type + " Alert",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        HazardDecorations.hazardSeverityText.getValue(alert.severity),
                        fontSize = 12.sp,
                        color = HazardDecorations.hazardSeverityColor.getValue(alert.severity),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .background(Color(0xFFFDD9D9), shape = RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Text(
                    alert.details,
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
                    formatDateTime(alert.timestamp),
                    fontSize = 12.sp,
                    color = Color.DarkGray
                )

            }
        }
    }
}


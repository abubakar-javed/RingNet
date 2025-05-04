package com.ranamahadahmer.ringnet.views.dashboard.home.components


import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.UserAlertsResponse
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring.components.AlertCard

@Composable
fun RecentAlerts(modifier: Modifier, viewModel: AppViewModel) {
    val recentAlert = viewModel.hazardAlert.collectAsState()
    Column(modifier) {

        Text(
            text = "Recent Alerts",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))


        when (recentAlert.value) {
            is UserAlertsResponse.Loading -> {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }

            is UserAlertsResponse.Error -> {

                Text(
                    text = "Error Loading Alerts..",
                    fontSize = 16.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(16.dp)
                )

            }

            is UserAlertsResponse.Success -> {
                val alerts =
                    (recentAlert.value as UserAlertsResponse.Success).alerts
                if (alerts.isEmpty()) {

                    Text(
                        text = "No Alerts found for your Location",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(16.dp)
                    )

                } else {

                    Column {
                        alerts.take(3).forEach { alert ->
                            AlertCard(alert)
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
//                    for (alert in alerts.take(5)) {
//                        AlertCard(alert)
//                        Spacer(modifier = Modifier.height(12.dp))
//                    }


                }
            }

            UserAlertsResponse.Initial -> TODO()
        }


    }
}

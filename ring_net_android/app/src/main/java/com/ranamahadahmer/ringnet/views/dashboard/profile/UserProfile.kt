package com.ranamahadahmer.ringnet.views.dashboard.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun UserProfile() {
    val state = rememberScrollState()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(state)
            .padding(horizontal = 16.dp)
    ) {

        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(Color(202, 23, 28, 255)),
                contentAlignment = Alignment.Center
            ) {
                Text("RMA", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Name and Role
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Rana Mahad Ahmer", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Spacer(modifier = Modifier.height(12.dp))
                Row {
                    listOf("H-12", "Islamabad", "Pakistan").forEach {
                        RegionChip(it)
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                }
            }


        }


        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(thickness = 2.dp)
        SectionHeader("Personal Information")
        PersonalInfoField()


        // Alert Preferences
        SectionHeader("Alert Preferences")

        Card(
            shape = RoundedCornerShape(8.dp),
            elevation = CardDefaults.cardElevation(4.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notification Icon",
                        tint = Color(202, 23, 28, 255)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Notification Settings", fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(8.dp))

                val alerts = listOf("Earthquakes", "Tsunamis", "Floods")

                Row {
                    alerts.forEach {
                        AlertChip(it) { /* Handle Remove */ }
                        Spacer(modifier = Modifier.width(4.dp))
                    }
                }
            }
        }
    }
}

// Section Header
@Composable
fun SectionHeader(title: String) {
    Text(
        title,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        modifier = Modifier.padding(vertical = 8.dp)
    )
}


// Region Chips
@Composable
fun RegionChip(region: String) {
    Box(
        modifier = Modifier
            .background(Color.LightGray, shape = RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Text(region, fontSize = 12.sp)
    }
}


@Composable
fun PersonalInfoField() {
    Card(
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),

        ) {
        Column(modifier = Modifier.padding(8.dp)) {
            OutlinedTextField(
                value = "Rana Mahad",
                onValueChange = { },
                label = { Text("First Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = "Ahmer",
                onValueChange = { },
                label = { Text("Last Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                leadingIcon = {
                    Icon(
                        Icons.Default.Email,
                        contentDescription = "Phone",
                        tint = Color(202, 23, 28, 255)
                    )

                },
                value = "abc@gmail.com",
                onValueChange = { },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                leadingIcon = {
                    Icon(
                        Icons.Default.Phone,
                        contentDescription = "Phone",
                        tint = Color(202, 23, 28, 255)
                    )
                },
                value = "+92 331 6625623",
                onValueChange = { },
                label = { Text("Phone") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

        }

    }
}

// Alert Chips
@Composable
fun AlertChip(alert: String, onRemove: () -> Unit) {
    Row(
        modifier = Modifier
            .background(Color.Red.copy(alpha = 0.1f), shape = RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(alert, color = Color.Red, fontSize = 12.sp)
        Spacer(modifier = Modifier.width(4.dp))
        Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Remove $alert",
            tint = Color.Red,
            modifier = Modifier
                .size(16.dp)
                .clickable { onRemove() }
        )
    }
}

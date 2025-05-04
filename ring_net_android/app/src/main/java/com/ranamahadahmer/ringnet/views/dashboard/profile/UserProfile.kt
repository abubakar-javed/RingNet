package com.ranamahadahmer.ringnet.views.dashboard.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.ProfileResponse
import com.ranamahadahmer.ringnet.view_models.AppViewModel

private fun getInitials(name: String): String {
    return name.split(" ")
        .filter { it.isNotEmpty() }
        .map { it[0] }
        .joinToString("")
        .uppercase()
}

@Composable
fun UserProfile(viewModel: AppViewModel) {
    val state = rememberScrollState()
    val profile = viewModel.profile.collectAsState()



    when (profile.value) {
        is ProfileResponse.Loading -> {
//            // Show loading indicator
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
//            Text(
//                text = "Loading Profile...",
//                fontSize = 16.sp,
//                color = Color.Gray,
//                modifier = Modifier.padding(16.dp)
//            )
        }

        is ProfileResponse.Success -> {
            val data = (profile.value as ProfileResponse.Success)
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
                        Text(
                            getInitials(data.name),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Name and Role
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(data.name, fontWeight = FontWeight.Bold, fontSize = 20.sp)
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
                PersonalInfoField(
                    viewModel
                )


                // Alert Preferences
                SectionHeader("Alert Preferences")
                SelectedAlerts(viewModel)


            }
        }

        is ProfileResponse.Error -> {
            val data = (profile.value as ProfileResponse.Error)
            Text(
                text = data.message,
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.padding(16.dp)
            )
        }

        else -> {}
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

@Composable
fun SelectedAlerts(viewModel: AppViewModel) {

    val isEditing = viewModel.isEditingProfile.collectAsState()

    val showAlertDialog = viewModel.showAlertDialog.collectAsState()
    val selectedAlerts = viewModel.selectedAlerts.collectAsState()



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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Notification Settings", fontWeight = FontWeight.Bold)

                    if (isEditing.value) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = null,
                            modifier = Modifier
                                .padding(end = 16.dp)
                                .clickable {
                                    viewModel.setShowAlertDialog(true)
                                }
                        )

                    }
                }

            }

            Spacer(modifier = Modifier.height(8.dp))

            Row {
                if (selectedAlerts.value.isEmpty()) {
                    Text(
                        text = "No alert preferences set.",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(16.dp)
                    )
                }
                selectedAlerts.value.forEach {
                    AlertChip(it)
                    Spacer(modifier = Modifier.width(4.dp))
                }
            }
        }
    }

    if (showAlertDialog.value) {
        AlertDialog(
            onDismissRequest = { viewModel.setShowAlertDialog(false) },
            title = { Text("Add Alerts") },
            text = {
                Column {
                    viewModel.alertTypes.forEach { alert ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.setSelectedAlertClickRow(alert)
                                }
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = selectedAlerts.value.contains(alert),
                                onCheckedChange = { checked ->
                                    viewModel.setSelectedAlertClickBox(checked, alert)
                                }
                            )
                            Text(alert)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    // Update alert preferences
//                    val currentProfile = (profile.value as? ProfileResponse.Success)
//                    if (currentProfile != null) {
//                        viewModel.updateProfile(
//                            currentProfile.copy(
//                                alertPreferences = selectedAlerts.toList()
//                            )
//                        )
//                    }
                    viewModel.setShowAlertDialog(false)
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setShowAlertDialog(false) }) {
                    Text("Cancel")
                }
            }
        )
    }
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
fun PersonalInfoField(viewModel: AppViewModel) {
    val isEditingProfile = viewModel.isEditingProfile.collectAsState()
    val name = viewModel.name.collectAsState()
    val email = viewModel.email.collectAsState()
    val phone = viewModel.phone.collectAsState()
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
                leadingIcon = {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = "Person",
                        tint = Color(202, 23, 28, 255)
                    )

                },
                value = name.value,
                onValueChange = { viewModel.setName(it) },
                label = { Text("Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                enabled = isEditingProfile.value
            )

            OutlinedTextField(
                leadingIcon = {
                    Icon(
                        Icons.Default.Email,
                        contentDescription = "Email",
                        tint = Color(202, 23, 28, 255)
                    )

                },
                value = email.value,
                onValueChange = { viewModel.setEmail(it) },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                enabled = isEditingProfile.value
            )
            OutlinedTextField(
                leadingIcon = {
                    Icon(
                        Icons.Default.Phone,
                        contentDescription = "Phone",
                        tint = Color(202, 23, 28, 255)
                    )
                },
                value = phone.value,
                onValueChange = { viewModel.setPhone(it) },
                label = { Text("Phone") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                enabled = isEditingProfile.value

            )

        }

    }
}

// Alert Chips
@Composable
fun AlertChip(alert: String) {
    Row(
        modifier = Modifier
            .background(Color.Red.copy(alpha = 0.1f), shape = RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(alert, color = Color.Red, fontSize = 12.sp)

    }
}

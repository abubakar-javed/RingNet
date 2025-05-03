package com.ranamahadahmer.ringnet.views.dashboard.home.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.emergency_contacts.EmergencyContact
import com.ranamahadahmer.ringnet.models.emergency_contacts.EmergencyContactsResponse
import com.ranamahadahmer.ringnet.view_models.AppViewModel

@Composable
fun EmergencyContactsScreen(modifier: Modifier, appModel: AppViewModel) {
    val contacts = appModel.emergencyContacts.collectAsState()
    Column(modifier) {
        Text(
            text = "Emergency Contacts",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,

            )
        Spacer(modifier = Modifier.height(8.dp))
        when (contacts.value) {
            is EmergencyContactsResponse.Loading -> {
                Text(
                    text = "Loading Emergency Contacts...",
                    fontSize = 16.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(16.dp)
                )
            }

            is EmergencyContactsResponse.Error -> {
                Text(
                    text = "Error Loading Emergency Contacts",
                    fontSize = 16.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(16.dp)
                )
            }

            is EmergencyContactsResponse.Success -> {
                val contacts = (contacts.value as EmergencyContactsResponse.Success).list
                if (contacts.isEmpty()) {
                    Text(
                        text = "No Emergency Contacts found for your Location",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(16.dp)
                    )
                } else {
                    contacts.forEach { contact ->
                        EmergencyContactCard(contact)
                    }

                }
            }

            EmergencyContactsResponse.Initial -> TODO()
        }

    }
}


@Composable
fun EmergencyContactCard(contact: EmergencyContact) {
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
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = contact.dept,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Call: ${contact.contact}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }

            Text(
                text = contact.status,
                color = Color(0xFF22C55E), // Green for "Available"
                fontSize = 14.sp,
                modifier = Modifier
                    .background(Color(0xE6ECFDF5), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            )

        }
    }
}

@Preview
@Composable
fun EmergencyContactCardPreview() {
    val contact = EmergencyContact(
        dept = "Fire Department",
        contact = "123-456-7890",
        status = "Available"
    )
    EmergencyContactCard(contact)
}

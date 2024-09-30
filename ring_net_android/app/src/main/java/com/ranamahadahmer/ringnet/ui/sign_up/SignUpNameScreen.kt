package com.ranamahadahmer.ringnet.ui.sign_up

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContactEmergency
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.ui.shared_elements.CustomButton
import com.ranamahadahmer.ringnet.ui.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.ui.shared_elements.TextFieldType


@Composable
fun SignUpNameScreen(modifier: Modifier = Modifier,navigateToConfirmationScreen: () -> Unit) {
    val scroll = rememberScrollState(0)
    Scaffold(modifier = modifier
            .fillMaxSize()
            .scrollable(scroll, orientation = Orientation.Vertical)
    ) {
        Column(
            modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(it)
                    .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(32.dp,
                alignment = Alignment.Top)
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.Start)) {
                Image(painterResource(R.drawable.icon),
                    contentDescription = null,
                    modifier = Modifier.size(40.dp)
                )
                Text("RingNet",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    textAlign = TextAlign.Center,
                    fontSize = 32.sp)
            }

            Text("Create Your Account",
                color = Color.Black,
                fontWeight = FontWeight.W500,
                textAlign = TextAlign.Center,
                fontSize = 32.sp)

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("First Name", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.ContactEmergency,
                    "First Name",
                    type = TextFieldType.Name)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Last Name", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.ContactEmergency,
                    "Last Name",
                    type = TextFieldType.Name)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Enter Password",
                    type = TextFieldType.Password)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Confirm Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Confirm Password",
                    type = TextFieldType.Password)
            }
            CustomButton(
                modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                onClick = navigateToConfirmationScreen,
            ) { Text("Continue", fontSize = 18.sp) }


        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewSignUpNameScreen() {
    SignUpNameScreen {}
}
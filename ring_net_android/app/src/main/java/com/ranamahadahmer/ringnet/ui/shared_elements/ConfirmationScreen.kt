package com.ranamahadahmer.ringnet.ui.shared_elements

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachEmail
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R


@Composable
fun ConfirmationScreen(modifier: Modifier = Modifier,navToNext: () -> Unit = {}) {
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
            verticalArrangement = Arrangement.spacedBy(28.dp, Alignment.Top)
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
            Image(painterResource(R.drawable.signup_email_confirm),
                contentDescription = null,
                contentScale = ContentScale.FillWidth,
                modifier = Modifier.size(240.dp)
            )
            Text("Confirm your Email",
                fontSize = 24.sp,
                fontWeight = FontWeight.W600,
                textAlign = TextAlign.Center
            )
            Text("We’ve sent 5 digits verification code\n" +
                    "to Hello@tyler.com",
                fontSize = 16.sp,
                color = Color.Gray, fontWeight = FontWeight.W500,
                textAlign = TextAlign.Center
            )

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter Verification Code", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.AttachEmail,
                    "OTP",
                    type = TextFieldType.Name,
                    trailing = { Text("Optional", color = Color.Gray) })
            }
            Button(modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = navToNext,
                colors = ButtonDefaults.buttonColors().copy(containerColor = Color(0xFFD60404)),
                shape = RoundedCornerShape(12.dp)
            ) {
//                TODO: Get the following text from NavHost to reuse this screen in multiple paths
                Text("Verify and Create Account", fontSize = 18.sp)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewConfirmationScreen() {
    ConfirmationScreen()
}
package com.ranamahadahmer.ringnet.ui.signup

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
import androidx.compose.material.icons.outlined.Email
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
import com.ranamahadahmer.ringnet.ui.components.CustomTextField


@Composable
fun SignUpEmailScreen(modifier: Modifier = Modifier) {
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
            horizontalAlignment = Alignment.Start,
            verticalArrangement = Arrangement.spacedBy(28.dp,
                alignment = Alignment.Top)
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
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
            Column(modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Create Your Account",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    textAlign = TextAlign.Center,
                    fontSize = 32.sp)
                Image(painterResource(R.drawable.signup_email),
                    contentDescription = null,
                    contentScale = ContentScale.FillWidth,
                    modifier = Modifier.fillMaxWidth()
                )

            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Email or Phone Number", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Email, "Enter your Email")
            }



            Button(modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = {},
                colors = ButtonDefaults.buttonColors().copy(containerColor = Color(0xFFD60404)),
                shape = RoundedCornerShape(12.dp)
            ) { Text("Continue", fontSize = 18.sp) }


        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewLoginFormScreen() {
    SignUpEmailScreen()
}
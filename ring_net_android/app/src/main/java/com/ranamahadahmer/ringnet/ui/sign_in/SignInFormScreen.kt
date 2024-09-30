package com.ranamahadahmer.ringnet.ui.sign_in

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.ui.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.ui.shared_elements.TextFieldType


@Composable
fun SignInFormScreen(modifier: Modifier = Modifier,
                     navigateToSuccessScreen: () -> Unit,
                     navigateToSignUpScreen: () -> Unit,
                     navigateToForgotPasswordScreen: () -> Unit = {}
                     ) {
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
                alignment = Alignment.CenterVertically)
        ) {
            Column(modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Image(painterResource(R.drawable.icon),
                    contentDescription = "Icon",
                    modifier = Modifier.size(80.dp)
                )
                Text("RingNet",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    fontSize = 40.sp)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Email or Phone Number", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Email,
                    "Enter your Email",
                    type = TextFieldType.Email)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Enter your password",
                    type = TextFieldType.Password)
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                Text("Forget Password", color = Color(0xFFAF1616), fontWeight = FontWeight.Bold,modifier = Modifier.clickable { navigateToForgotPasswordScreen() })
            }

            Button(modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = navigateToSuccessScreen,
                colors = ButtonDefaults.buttonColors().copy(containerColor = Color(0xFFD60404)),
                shape = RoundedCornerShape(12.dp)
            ) { Text("Login", fontSize = 18.sp) }

            Row(modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(space = 8.dp,
                    alignment = Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically) {
                HorizontalDivider(thickness = 1.dp,
                    color = Color(0xFAE3E1E3),
                    modifier = Modifier.weight(1f))
                Text("You can connect with", color = Color.Gray, fontWeight = FontWeight.W500)
                HorizontalDivider(thickness = 1.dp,
                    color = Color(0xFFE3E1E3),
                    modifier = Modifier.weight(1f))
            }

            Row(modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(24.dp,
                    alignment = Alignment.CenterHorizontally)) {
                Image(painterResource(R.drawable.facebook),
                    contentDescription = null,
                    modifier = Modifier.size(50.dp)
                )

                Image(painterResource(R.drawable.google),
                    contentDescription = null,
                    modifier = Modifier.size(50.dp)
                )
            }
            Row(modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp,
                    alignment = Alignment.CenterHorizontally)) {
                Text("Don't have an account?", color = Color.Gray, fontWeight = FontWeight.W500)
                Text("Sign Up", color = Color(0xFFAF1616), fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { navigateToSignUpScreen() })
            }


        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewSignInFormScreen() {
    SignInFormScreen(navigateToSuccessScreen = {}, navigateToSignUpScreen = {}){}
}
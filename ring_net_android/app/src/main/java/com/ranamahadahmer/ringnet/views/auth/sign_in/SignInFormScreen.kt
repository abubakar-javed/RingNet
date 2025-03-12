package com.ranamahadahmer.ringnet.views.auth.sign_in

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.models.auth.AuthResponse
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import com.ranamahadahmer.ringnet.views.auth.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.views.auth.shared_elements.TextFieldType


@Composable
fun SignInFormScreen(
    modifier: Modifier = Modifier,
    navigateToSuccessScreen: () -> Unit,
    navigateToSignUpScreen: () -> Unit,
    navigateToForgotPasswordScreen: () -> Unit = {},
    viewModel: AuthViewModel
) {
    val response by viewModel.signInResponse.collectAsState()
    val scroll = rememberScrollState(0)
    val context = LocalContext.current

    LaunchedEffect(response) {
        if (response is AuthResponse.Success) {
            navigateToSuccessScreen()
        }
    }
    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.ime)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(it)

                .verticalScroll(scroll)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.Start,
            verticalArrangement = Arrangement.spacedBy(
                28.dp,
                alignment = Alignment.CenterVertically
            )
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(
                    painterResource(R.drawable.icon),
                    contentDescription = "Icon",
                    modifier = Modifier.size(80.dp)
                )
                Text(
                    "RingNet",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    fontSize = 40.sp
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {

                Text("Email or Phone Number", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(
                    Icons.Outlined.Email,
                    "Enter your Email",
                    valueState = viewModel.email,
                    onChange = viewModel::changeEmail,
                    type = TextFieldType.Email
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(
                    icon = Icons.Outlined.Lock,
                    placeHolder = "Enter your password",
                    valueState = viewModel.passwordOne,
                    onChange = viewModel::changePasswordOne,
                    type = TextFieldType.Password
                )
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                Text(
                    "Forget Password",
                    color = Color(0xFFAF1616),
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { navigateToForgotPasswordScreen() })
            }

            Button(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = {
                    if (viewModel.emailEmpty()) {
                        Toast.makeText(context, "Please enter Email !", Toast.LENGTH_SHORT)
                            .show()
                        return@Button
                    }
                    if (viewModel.emailValid().not()) {
                        Toast.makeText(context, "Please enter Valid Email !", Toast.LENGTH_SHORT)
                            .show()
                        return@Button
                    }
                    if (viewModel.passwordValid().not()) {
                        Toast.makeText(
                            context,
                            "Password must be at least 6 characters long !",
                            Toast.LENGTH_SHORT
                        )
                            .show()
                        return@Button
                    }
                    viewModel.signIn()
                },
                colors = ButtonDefaults.buttonColors().copy(containerColor = Color(0xFFD60404)),
                shape = RoundedCornerShape(12.dp)
            ) {
                when (response) {
                    is AuthResponse.Loading -> {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White
                        )
                    }

                    is AuthResponse.Success -> {}
                    is AuthResponse.Error -> {
                        Toast.makeText(
                            context,
                            "Error Occurred",
                            Toast.LENGTH_SHORT
                        ).show()
                    }

                    AuthResponse.Initial -> {
                        Text("Login", fontSize = 18.sp, color = Color.White)
                    }
                }

            }


            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(
                    4.dp,
                    alignment = Alignment.CenterHorizontally
                )
            ) {
                Text("Don't have an account?", color = Color.Gray, fontWeight = FontWeight.W500)
                Text(
                    "Sign Up", color = Color(0xFFAF1616), fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { navigateToSignUpScreen() })
            }
        }
    }
}


@Composable
@Preview
fun SignInFormScreenPreview() {
    SignInFormScreen(
        navigateToSuccessScreen = {},
        navigateToSignUpScreen = {},
        modifier = Modifier,
        navigateToForgotPasswordScreen = { },
        viewModel = AuthViewModel(LocalContext.current)
    )
}
package com.ranamahadahmer.ringnet.views.sign_up

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContactEmergency
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.models.AuthResponse
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import com.ranamahadahmer.ringnet.views.shared_elements.CustomButton
import com.ranamahadahmer.ringnet.views.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.views.shared_elements.TextFieldType


@Composable
fun SignUpNameScreen(modifier: Modifier = Modifier,
                     navigateToConfirmationScreen: () -> Unit,
                     viewModel: AuthViewModel) {
    val scroll = rememberScrollState(0)
    val context = LocalContext.current
    val response by viewModel.signUpResponse.collectAsState()

    LaunchedEffect(response) {
        if (response is AuthResponse.Success) {

            navigateToConfirmationScreen()
        }

    }


    Scaffold(modifier = modifier
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
                    valueState = viewModel.firstName,
                    onChange = viewModel::changeFirstName,
                    type = TextFieldType.Name)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Last Name", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.ContactEmergency,
                    "Last Name",
                    valueState = viewModel.lastName,
                    onChange = viewModel::changeLastName,
                    type = TextFieldType.Name)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Enter Password",
                    valueState = viewModel.passwordOne,
                    onChange = viewModel::changePasswordOne,
                    type = TextFieldType.Password)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Confirm Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Confirm Password",
                    valueState = viewModel.passwordTwo,
                    onChange = viewModel::changePasswordTwo,
                    type = TextFieldType.Password)
            }
            CustomButton(
                modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                onClick = {
                    if (viewModel.signUpValid().not()) {
                        Toast.makeText(context, "Please fill all fields !", Toast.LENGTH_SHORT)
                                .show()
                        return@CustomButton
                    }
                    if (viewModel.passwordsMatch().not()) {
                        Toast.makeText(context, "Passwords do not match !", Toast.LENGTH_SHORT)
                                .show()
                        return@CustomButton
                    }
                    if (viewModel.passwordValid().not()) {
                        Toast.makeText(context,
                            "Password must be at least 6 characters long !",
                            Toast.LENGTH_SHORT).show()
                        return@CustomButton
                    }
                    viewModel.signUp()
                },
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
                        Text("Sign Up", fontSize = 18.sp, color = Color.White)
                    }
                }

            }
        }
    }
}

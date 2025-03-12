package com.ranamahadahmer.ringnet.views.auth.sign_up

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
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import com.ranamahadahmer.ringnet.views.auth.shared_elements.CustomButton
import com.ranamahadahmer.ringnet.views.auth.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.views.auth.shared_elements.TextFieldType


@Composable
fun SignUpEmailScreen(
    modifier: Modifier = Modifier,
    navigateToSignUpNameScreen: () -> Unit,
    viewModel: AuthViewModel
) {
    val scroll = rememberScrollState(0)
    val context = LocalContext.current
    Scaffold(
        modifier = modifier
            .fillMaxSize()

    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(it)
                .windowInsetsPadding(WindowInsets.ime)
                .verticalScroll(scroll)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(
                32.dp,
                alignment = Alignment.Top
            )
        ) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.Start)
            ) {
                Image(
                    painterResource(R.drawable.icon),
                    contentDescription = null,
                    modifier = Modifier.size(40.dp)
                )
                Text(
                    "RingNet",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    textAlign = TextAlign.Center,
                    fontSize = 32.sp
                )
            }
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "Create Your Account",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    textAlign = TextAlign.Center,
                    fontSize = 32.sp
                )
                Image(
                    painterResource(R.drawable.signup_email),
                    contentDescription = null,
                    contentScale = ContentScale.FillWidth,
                    modifier = Modifier.fillMaxWidth()
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

            CustomButton(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = {
                    if (viewModel.emailEmpty()) {
                        Toast.makeText(context, "Enter Email !", Toast.LENGTH_SHORT)
                            .show()
                        return@CustomButton
                    }
                    if (viewModel.emailValid().not()) {
                        Toast.makeText(context, "Incorrect Email !", Toast.LENGTH_SHORT)
                            .show()
                        return@CustomButton
                    }
                    navigateToSignUpNameScreen()
                },
            ) { Text("Continue", fontSize = 18.sp) }
        }
    }
}


package com.ranamahadahmer.ringnet.views.forget_password

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
import com.ranamahadahmer.ringnet.views.shared_elements.CustomButton
import com.ranamahadahmer.ringnet.views.shared_elements.CustomTextField
import com.ranamahadahmer.ringnet.views.shared_elements.TextFieldType
import kotlinx.coroutines.flow.MutableStateFlow


@Composable
fun ForgetPasswordPasswordScreen(modifier: Modifier = Modifier,
                                 navigateToSignInScreen: () -> Unit = {}) {
    val scroll = rememberScrollState(0)
    val value1 = MutableStateFlow("")
    val value2 = MutableStateFlow("")

    Scaffold(modifier = modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.ime)

    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(it)
                    .verticalScroll(scroll)
                    .padding(horizontal = 24.dp),
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
            Column(modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally) {
                Image(painterResource(R.drawable.forget_password_password),
                    contentDescription = null,
                    modifier = Modifier.size(240.dp)
                )
                Text("Enter New Password",
                    color = Color.Black,
                    fontWeight = FontWeight.W500,
                    textAlign = TextAlign.Center,
                    fontSize = 32.sp)

            }
            Text("Set Complex passwords to protect your account",
                fontSize = 16.sp,
                textAlign = TextAlign.Center
            )
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Enter Password",
                    valueState = value1,
                    onChange = {},
                    type = TextFieldType.Password)
            }
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Confirm Password", color = Color.Black, fontWeight = FontWeight.Bold)
                CustomTextField(Icons.Outlined.Lock,
                    "Confirm Password",
                    valueState = value2,
                    onChange = {},
                    type = TextFieldType.Password)
            }

            CustomButton(
                modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                onClick = navigateToSignInScreen,
            ) { Text("Continue", fontSize = 18.sp) }


        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewForgetPasswordPasswordScreen() {
    ForgetPasswordPasswordScreen()
}
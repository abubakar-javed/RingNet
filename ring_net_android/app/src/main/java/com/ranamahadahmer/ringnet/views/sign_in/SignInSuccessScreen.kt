package com.ranamahadahmer.ringnet.views.sign_in

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
fun SignInSuccessScreen(modifier: Modifier = Modifier, onNavigate: () -> Unit = {}) {
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
            Spacer(modifier = Modifier.height(24.dp))
            Image(painterResource(R.drawable.loginsucess),
                contentDescription = "Icon",
                contentScale = ContentScale.FillWidth,
                modifier = Modifier.fillMaxWidth()
            )
            Text("Yeh! Login Successful",
                fontSize = 24.sp,
                color = Color.Black,
                fontWeight = FontWeight.W600,
                textAlign = TextAlign.Center
            )
            Text("You will be moved to home screen right now. Enjoy the features!",
                fontSize = 16.sp,
                color = Color.Gray, fontWeight = FontWeight.W500,
                textAlign = TextAlign.Center
            )
            Button(modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                onClick = onNavigate,
                colors = ButtonDefaults.buttonColors().copy(containerColor = Color(0xFFD60404)),
                shape = RoundedCornerShape(12.dp)
            ) { Text("Let's Explore", fontSize = 18.sp, color = Color.White) }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewSignInSuccessScreen() {
    SignInSuccessScreen {}
}
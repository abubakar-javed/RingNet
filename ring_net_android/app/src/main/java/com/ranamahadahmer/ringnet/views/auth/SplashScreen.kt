package com.ranamahadahmer.ringnet.views.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R

@Composable
fun SplashScreen(modifier: Modifier = Modifier, navigateToNextScreen: () -> Unit) {
    Scaffold(modifier = modifier.fillMaxSize()) {
        val brush = Brush.verticalGradient(
            colorStops = arrayOf(
                0.4f to Color(0xFFFFFFFF),
                0.4f to Color(0xFF791616)
            ),
        )
        Column(
            modifier = Modifier
                .padding(it)
                .background(brush)
                .fillMaxSize(),
            verticalArrangement = Arrangement.SpaceAround,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier
                    .height(400.dp)
                    .width(300.dp),
                shape = RoundedCornerShape(20.dp)
            ) {
                Image(
                    painterResource(R.drawable.earthquake),
                    null,
                    modifier = Modifier.fillMaxSize(),
                    alignment = Alignment.Center,
                    contentScale = ContentScale.FillBounds
                )
            }
            Text(
                stringResource(R.string.grow_your_insights_with_latest_alerts),
                modifier = Modifier.padding(horizontal = 54.dp),
                fontSize = 32.sp,
                lineHeight = 40.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                stringResource(R.string.explore_the_world_of_analyzing_news_and_sports_where_you_will_be_submerged_to_games),
                modifier = Modifier.padding(horizontal = 54.dp),
                textAlign = TextAlign.Center
            )


//            TODO: Replace the following code with button from Login Screen

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFAF1616),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 64.dp)
                    .clickable { navigateToNextScreen() },

                ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 20.dp, horizontal = 24.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        "GET STARTED",
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp,
                        fontFamily = FontFamily.SansSerif,
                    )
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForwardIos,
                        contentDescription = null
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SplashScreenPreview() {
    SplashScreen(navigateToNextScreen = {})
}
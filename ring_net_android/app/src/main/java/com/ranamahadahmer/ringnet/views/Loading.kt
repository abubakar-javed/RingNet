package com.ranamahadahmer.ringnet.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import java.util.Timer
import kotlin.concurrent.schedule

@Composable
fun Loading(modifier: Modifier = Modifier, navigateToNextScreen: () -> Unit) {
    Timer().schedule(1000) {
        println("HELLO")
        navigateToNextScreen()
    }
    Scaffold(modifier = modifier.fillMaxSize()) {


        Column(
            modifier = Modifier
                    .padding(it)

                    .fillMaxSize(),
            verticalArrangement = Arrangement.SpaceAround,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            CircularProgressIndicator()
        }
    }
}


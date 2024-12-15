package com.ranamahadahmer.ringnet.views

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import kotlinx.coroutines.delay

@Composable
fun Loading(modifier: Modifier = Modifier, navigateToNextScreen: () -> Unit) {
    LaunchedEffect(true) {
        delay(200)
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


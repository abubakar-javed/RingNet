package com.ranamahadahmer.ringnet


import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge

import androidx.compose.runtime.Composable

import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.ranamahadahmer.ringnet.ui.login.LoginFormScreen
import com.ranamahadahmer.ringnet.ui.SplashScreen
import com.ranamahadahmer.ringnet.ui.theme.RingNetTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            RingNetTheme {
                RingNetApp()
            }
        }
    }
}


@Composable
fun RingNetApp() {
    val navHost = rememberNavController()
    NavHost(navController = navHost, startDestination = "login_screen") {
        composable("splash_screen") {
            SplashScreen {
                navHost.navigate("login_screen")
            }
        }
        composable("login_screen") {
            LoginFormScreen()
        }
    }
}



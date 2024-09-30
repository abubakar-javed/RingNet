package com.ranamahadahmer.ringnet


import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.ranamahadahmer.ringnet.ui.SplashScreen
import com.ranamahadahmer.ringnet.ui.forget_password.ForgetPasswordEmailScreen
import com.ranamahadahmer.ringnet.ui.forget_password.ForgetPasswordPasswordScreen
import com.ranamahadahmer.ringnet.ui.shared_elements.ConfirmationScreen
import com.ranamahadahmer.ringnet.ui.sign_in.SignInFormScreen
import com.ranamahadahmer.ringnet.ui.sign_in.SignInSuccessScreen
import com.ranamahadahmer.ringnet.ui.sign_up.SignUpEmailScreen
import com.ranamahadahmer.ringnet.ui.sign_up.SignUpNameScreen
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
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "splash_screen") {
        composable("splash_screen") {
            SplashScreen {
                navController.navigate("sign_in_form")
            }
        }
        composable("sign_in_form") {
            SignInFormScreen(
                navigateToSuccessScreen = { navController.navigate("sign_in_success") },
                navigateToSignUpScreen = { navController.navigate("sign_up_email") },
                navigateToForgotPasswordScreen = { navController.navigate("forgot_password_email") }
            )
        }
        composable("sign_in_success") {
            SignInSuccessScreen {

            }
        }
        composable("sign_up_email") {
            SignUpEmailScreen {
                navController.navigate("sign_up_name")
            }
        }
        composable("sign_up_name") {
            SignUpNameScreen {
                navController.navigate("confirmation_screen")
            }
        }
        composable("confirmation_screen") {
            ConfirmationScreen {
                navController.navigate("forgot_password_password")
            }
        }
        composable("forgot_password_email") {
            ForgetPasswordEmailScreen {
                navController.navigate("confirmation_screen")
            }
        }
        composable("forgot_password_password") {
            ForgetPasswordPasswordScreen {
                navController.navigate("sign_in_form")
            }
        }

    }
}



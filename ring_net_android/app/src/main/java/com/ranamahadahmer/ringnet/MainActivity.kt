package com.ranamahadahmer.ringnet


import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
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
import com.ranamahadahmer.ringnet.view_models.SignInViewModel

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
    val signInViewModel = SignInViewModel()

    NavHost(navController = navController, startDestination = "splash_screen") {
        composable("splash_screen") {
            SplashScreen {
                navController.popBackStack()
                navController.navigate("sign_in")
            }
        }

        navigation(startDestination = "form", route = "sign_in") {
            composable("form") {
                SignInFormScreen(
                    viewModel = signInViewModel,
                    navigateToSuccessScreen = {
                        navController.popBackStack()
                        println("I was called")
                        navController.navigate("success")
                    },
                    navigateToSignUpScreen = {
                        navController.navigate("sign_up")
                    },
                    navigateToForgotPasswordScreen = { navController.navigate("forgot_password") }
                )
            }
            composable("success") {
                SignInSuccessScreen {}
            }
        }
        navigation(startDestination = "email_info", route = "sign_up") {
            composable("email_info") {
                SignUpEmailScreen {
                    navController.navigate("name_password")
                }
            }
            composable("name_password") {
                SignUpNameScreen {
                    val msg = "Verify and Create your account"
                    val nextPath = "sign_in"
                    navController.navigate("confirmation_screen/$msg/$nextPath")
                }
            }
        }
        navigation(startDestination = "email", route = "forgot_password") {
            composable("email") {
                val msg = "Verify and Set New Password"
                val nextPath = "new_password"
                ForgetPasswordEmailScreen {
                    navController.navigate("confirmation_screen/$msg/$nextPath")
                }
            }
            composable("new_password") {
                ForgetPasswordPasswordScreen {
                    navController.navigate("sign_in")
                }
            }
        }



        composable("confirmation_screen/{msg}/{path}") {
            val msg = it.arguments?.getString("msg") ?: ""
            val nextPath = it.arguments?.getString("path") ?: ""
            ConfirmationScreen(msg = msg) {
                navController.navigate(nextPath) {
                    popUpTo("sign_in") { inclusive = true }
                }
            }
        }

    }
}



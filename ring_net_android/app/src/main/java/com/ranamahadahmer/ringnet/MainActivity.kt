package com.ranamahadahmer.ringnet


import android.app.Application
import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import com.ranamahadahmer.ringnet.view_models.P2pModel
import com.ranamahadahmer.ringnet.views.Loading
import com.ranamahadahmer.ringnet.views.auth.SplashScreen


import com.ranamahadahmer.ringnet.views.auth.forget_password.ForgetPasswordEmailScreen
import com.ranamahadahmer.ringnet.views.auth.forget_password.ForgetPasswordPasswordScreen
import com.ranamahadahmer.ringnet.views.auth.shared_elements.ConfirmationScreen
import com.ranamahadahmer.ringnet.views.auth.sign_in.SignInFormScreen
import com.ranamahadahmer.ringnet.views.auth.sign_in.SignInSuccessScreen
import com.ranamahadahmer.ringnet.views.auth.sign_up.SignUpEmailScreen
import com.ranamahadahmer.ringnet.views.auth.sign_up.SignUpNameScreen
import com.ranamahadahmer.ringnet.views.dashboard.Dashboard
import com.ranamahadahmer.ringnet.views.theme.RingNetTheme


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestLocationPermissions()
        enableEdgeToEdge()
        setContent {
            RingNetTheme {
                RingNetApp()
            }
        }
    }

    private fun requestLocationPermissions() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                1
            )

        } else {
//            TODO: Close App if not given permission
        }
    }

}


@Composable
fun RingNetApp() {
    val navController = rememberNavController()
    val authViewModel = AuthViewModel(LocalContext.current)
    val application = LocalContext.current.applicationContext as Application
    P2pModel(application)
    val appModel = AppViewModel()

    val isUserLoggedIn by authViewModel.isUserLoggedIn.collectAsState()



    NavHost(navController = navController, startDestination = "loading_screen") {
        composable("loading_screen") {
            Loading {
                val nextDestination = if (isUserLoggedIn) "dashboard" else "splash_screen"
                navController.popBackStack()
                navController.navigate(nextDestination)
            }
        }
        composable("splash_screen") {

            SplashScreen {
                navController.popBackStack()
                navController.navigate("sign_in")
            }
        }

        navigation(startDestination = "form", route = "sign_in") {
            composable("form") {
                SignInFormScreen(
                    viewModel = authViewModel,
                    navigateToSuccessScreen = {
                        navController.popBackStack()
                        navController.navigate("success")
                    },
                    navigateToSignUpScreen = {
                        navController.navigate("sign_up")
                    },
                    navigateToForgotPasswordScreen = { navController.navigate("forgot_password") }
                )
            }
            composable("success") {
                SignInSuccessScreen {
                    navController.popBackStack()
                    authViewModel.saveUser()
                    navController.navigate("dashboard")
                }
            }
        }
        navigation(startDestination = "email_info", route = "sign_up") {
            composable("email_info") {
                SignUpEmailScreen(viewModel = authViewModel, navigateToSignUpNameScreen = {
                    navController.navigate("name_password")
                })
            }
            composable("name_password") {
                SignUpNameScreen(viewModel = authViewModel, navigate = {
                    navController.popBackStack()
                    navController.navigate("sign_in/success")
                })
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


        composable("dashboard") {
            Dashboard(appModel)
        }
    }
}



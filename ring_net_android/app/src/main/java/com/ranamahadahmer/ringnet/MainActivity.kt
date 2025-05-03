package com.ranamahadahmer.ringnet


import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.view_models.AuthViewModel

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
import kotlinx.coroutines.launch


class MainActivity : ComponentActivity() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var appViewModel: AppViewModel
    private lateinit var authViewModel: AuthViewModel

    // Permission handling
    private val requiredPermissions = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.INTERNET,
        Manifest.permission.ACCESS_NETWORK_STATE
    )

    companion object {
        private const val PERMISSIONS_REQUEST_CODE = 100
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initializeApp()
        setupLocation()
        setupUI()
        observeAuthState()
    }

    private fun initializeApp() {
        enableEdgeToEdge()
        authViewModel = AuthViewModel(this)
        appViewModel = AppViewModel(authViewModel = authViewModel)
//        P2PModel(this)
    }

    private fun setupLocation() {
        if (!checkPermissions()) {
            requestPermissions()
            return
        }
        initializeLocationClient()
    }

    private fun initializeLocationClient() {
        if (!::fusedLocationClient.isInitialized) {
            fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        }
    }

    private fun setupUI() {
        setContent {
            RingNetTheme {
                RingNetApp(authViewModel, appViewModel)
            }
        }
    }

    private fun observeAuthState() {
        lifecycleScope.launch {
            lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
                authViewModel.isUserLoggedIn.collect { isLoggedIn ->
                    if (isLoggedIn && checkPermissions()) {
                        startLocationUpdates()
                    }
                }
            }
        }
    }

    // Permission handling methods
    private fun checkPermissions(): Boolean {
        return requiredPermissions.all { permission ->
            ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestPermissions() {
        ActivityCompat.requestPermissions(
            this,
            requiredPermissions,
            PERMISSIONS_REQUEST_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            PERMISSIONS_REQUEST_CODE -> handlePermissionResult(grantResults)
        }
    }

    private fun handlePermissionResult(grantResults: IntArray) {
        if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
            initializeLocationClient()
        } else {
            showPermissionDeniedDialog()
        }
    }

    private fun showPermissionDeniedDialog() {
        AlertDialog.Builder(this)
            .setTitle("Permissions Required")
            .setMessage("This app requires location and internet permissions to function. The app will now close.")
            .setPositiveButton("OK") { _, _ -> finish() }
            .setCancelable(false)
            .show()
    }

    // Location updates
    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        try {
            initializeLocationClient()
            appViewModel.startLocationMonitoring(authViewModel.isUserLoggedIn.value) {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    location?.let { appViewModel.updateLocation(it) }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

@Composable
fun RingNetApp(authViewModel: AuthViewModel, appModel: AppViewModel) {
    val navController = rememberNavController()


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



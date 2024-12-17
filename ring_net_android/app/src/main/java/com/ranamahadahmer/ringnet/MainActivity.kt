package com.ranamahadahmer.ringnet


import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import com.ranamahadahmer.ringnet.views.Loading
import com.ranamahadahmer.ringnet.views.SplashScreen
import com.ranamahadahmer.ringnet.views.dashboard.DashboardScreen
import com.ranamahadahmer.ringnet.views.forget_password.ForgetPasswordEmailScreen
import com.ranamahadahmer.ringnet.views.forget_password.ForgetPasswordPasswordScreen
import com.ranamahadahmer.ringnet.views.shared_elements.ConfirmationScreen
import com.ranamahadahmer.ringnet.views.sign_in.SignInFormScreen
import com.ranamahadahmer.ringnet.views.sign_in.SignInSuccessScreen
import com.ranamahadahmer.ringnet.views.sign_up.SignUpEmailScreen
import com.ranamahadahmer.ringnet.views.sign_up.SignUpNameScreen
import com.ranamahadahmer.ringnet.views.theme.RingNetTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import nl.tudelft.ipv8.Community
import nl.tudelft.ipv8.IPv8Configuration
import nl.tudelft.ipv8.Overlay
import nl.tudelft.ipv8.OverlayConfiguration
import nl.tudelft.ipv8.android.IPv8Android
import nl.tudelft.ipv8.android.keyvault.AndroidCryptoProvider
import nl.tudelft.ipv8.keyvault.PrivateKey
import nl.tudelft.ipv8.messaging.Deserializable
import nl.tudelft.ipv8.messaging.Packet
import nl.tudelft.ipv8.messaging.Serializable
import nl.tudelft.ipv8.peerdiscovery.strategy.RandomWalk


class DemoCommunity : Community() {
    override val serviceId = "02313685c1912a141279f8248fc8db5899c5df5a"
    private val community = IPv8Android.getInstance().getOverlay<DemoCommunity>()!!
    val peers = community.getPeerss()
    private val MESSAGE_ID = 1

    private fun getPrivateKey(): PrivateKey {
        return AndroidCryptoProvider.generateKey()
    }

    private val demoCommunity = OverlayConfiguration(
        Overlay.Factory(DemoCommunity::class.java),
        listOf(RandomWalk.Factory())
    )
    val config = IPv8Configuration(overlays = listOf(
        demoCommunity
    ))

    class MyMessage(val message: String) : Serializable {
        override fun serialize(): ByteArray {
            return message.toByteArray()
        }

        companion object Deserializer : Deserializable<MyMessage> {
            override fun deserialize(buffer: ByteArray, offset: Int): Pair<MyMessage, Int> {
                return Pair(MyMessage(buffer.toString(Charsets.UTF_8)), buffer.size)
            }
        }
    }

    fun broadcastGreeting() {
        for (peer in getPeerss()) {
            val packet = MyMessage("Hello!").serialize()
            send(peer.address, packet)
        }
    }

    init {
        messageHandlers[MESSAGE_ID] = ::onMessage
    }

    private fun onMessage(packet: Packet) {
        val (peer, payload) = packet.getAuthPayload(MyMessage.Deserializer)
        println("DemoCommunity ${peer.mid} ${payload.message}")
    }


}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

//        val community = IPv8Android.getInstance().getOverlay<DemoCommunity>()!!
//        val peers = community.getPeerss()
//        for (peer in peers) {
//            println("DemoApplication ${peer.mid}")
//        }
//        lifecycleScope.launch {
//            while (isActive) {
//                community.broadcastGreeting()
//                delay(1000)
//            }
//        }

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
    val authViewModel = AuthViewModel(LocalContext.current)

    val userId by authViewModel.userId.collectAsState()


    val isUserLoggedIn by authViewModel.isUserLoggedIn.collectAsState()
    


    NavHost(navController = navController, startDestination = "loading_screen") {
        composable("loading_screen") {
            Loading {
                val nextDestination = if (isUserLoggedIn) "dashboard/$userId" else "splash_screen"
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
                    navController.navigate("dashboard/$userId")
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

        composable("dashboard/{message}") {
            val message = it.arguments?.getString("message") ?: ""
            DashboardScreen(message = message)
        }

    }
}



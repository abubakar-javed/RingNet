package com.ranamahadahmer.ringnet.views.dashboard


import android.annotation.SuppressLint
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.hazard_monitoring.HazardMonitor
import com.ranamahadahmer.ringnet.views.dashboard.home.Home
import com.ranamahadahmer.ringnet.views.dashboard.map.Map
import com.ranamahadahmer.ringnet.views.dashboard.notifications.Notifications
import com.ranamahadahmer.ringnet.views.dashboard.profile.UserProfile


val tabs = listOf(
    Icons.Default.Home,
    Icons.Default.Warning,
    Icons.Default.Map,
    Icons.Default.Notifications,
    Icons.Default.Person,
)


@RequiresApi(Build.VERSION_CODES.O)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Dashboard(viewModel: AppViewModel) {
    val pageState = viewModel.mainBottomBarState.collectAsState()
    val isEditingProfile = viewModel.isEditingProfile.collectAsState()
    val dashboardScrollState = viewModel.dashboardScrollState

    val snackbarMessage = viewModel.snackbarMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }


    LaunchedEffect(snackbarMessage.value) {
        snackbarMessage.value?.let {
            snackbarHostState.showSnackbar(it)
        }
    }

    Scaffold(


        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text =
                            when (pageState.value.currentPage) {
                                0 -> "Dashboard"
                                1 -> "Hazard Monitoring"
                                2 -> "Map"
                                3 -> "Notification"
                                4 -> "Profile"
                                else -> {
                                    "-"
                                }
                            },
                        style = TextStyle(fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    )

                },
                actions = {
                    when (pageState.value.currentPage) {
                        0 -> {
//                            Icon(
//                                Icons.Default.Settings,
//                                contentDescription = null,
//                                modifier = Modifier.padding(end = 16.dp)
//                            )
//                        TODO: Implement
                        }

                        1 -> {}
                        2 -> {}
                        3 -> {}
                        4 -> {
                            if (isEditingProfile.value) {
                                Icon(
                                    Icons.Default.Save,
                                    contentDescription = null,
                                    modifier = Modifier
                                        .padding(end = 16.dp)
                                        .clickable {
                                            viewModel.verifyUpdates()
                                        }
                                )
                            } else {
                                Icon(
                                    Icons.Default.Edit,
                                    contentDescription = null,
                                    modifier = Modifier
                                        .padding(end = 16.dp)
                                        .clickable {
                                            viewModel.setEditingProfile(
                                                true
                                            )
                                        }
                                )
                            }
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(item, contentDescription = null) },
                        selected = pageState.value.currentPage == index,
                        onClick = { viewModel.setMainPage(index) },
                        colors = NavigationBarItemDefaults.colors().copy(
                            selectedIconColor = Color.White,
                            selectedIndicatorColor = Color(202, 23, 28, 255)
                        )
                    )
                }
            }

        }

    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(it)
        )
        {
            HorizontalPager(
                userScrollEnabled = false,
                state = pageState.value
            ) { page ->
                when (page) {
                    0 -> {
                        Home(dashboardScrollState, appModel = viewModel)
                    }

                    1 -> {
                        HazardMonitor(
                            viewModel
                        )
                    }

                    2 -> {
                        Map(viewModel)

                    }

                    3 -> {
                        Notifications(
                            viewModel,
                            Modifier
                                .fillMaxSize()
                                .padding(horizontal = 8.dp)
                        )
                    }

                    4 -> {
                        UserProfile(viewModel = viewModel)
                    }
                }
            }
        }
    }


}



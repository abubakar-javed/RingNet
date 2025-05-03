package com.ranamahadahmer.ringnet.views.dashboard.map

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier

import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.CameraPositionState
import com.google.maps.android.compose.ComposeMapColorScheme
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.rememberCameraPositionState
import com.ranamahadahmer.ringnet.view_models.AppViewModel


// Map.kt
@Composable
fun Map(viewModel: AppViewModel) {
    val currentLocation by viewModel.currentLocation.collectAsState()
    val cameraPositionState = rememberCameraPositionState()
    val properties by remember {
        mutableStateOf(MapProperties(isMyLocationEnabled = true))
    }

    LaunchedEffect(currentLocation) {
        currentLocation?.let {
            updateCameraPosition(cameraPositionState, it)
        }
    }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = properties,
        mapColorScheme = ComposeMapColorScheme.LIGHT
    )
}


private fun updateCameraPosition(cameraPositionState: CameraPositionState, location: LatLng?) {
    location?.let {
        cameraPositionState.position = CameraPosition.fromLatLngZoom(it, 10f)
    }
}



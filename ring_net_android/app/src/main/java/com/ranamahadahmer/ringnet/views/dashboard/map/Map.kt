package com.ranamahadahmer.ringnet.views.dashboard.map

import android.annotation.SuppressLint
import android.location.Location
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.CameraPositionState
import com.google.maps.android.compose.ComposeMapColorScheme
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.rememberCameraPositionState


@Composable
fun Map() {
    val context = LocalContext.current
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    var currentLocation by remember { mutableStateOf<LatLng?>(null) }
    val cameraPositionState = rememberCameraPositionState()


    val properties by remember {
        mutableStateOf(MapProperties(isMyLocationEnabled = true))
    }



    LaunchedEffect(Unit) {
        getCurrentLocation(fusedLocationClient) { location ->
            currentLocation = LatLng(location.latitude, location.longitude)
            updateCameraPosition(cameraPositionState, currentLocation)
        }
    }

    LatLng(35.6762, 139.6503) // Tokyo, Japan
    LatLng(27.7172, 85.3240) // Kathmandu, Nepal


    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        mapColorScheme = ComposeMapColorScheme.LIGHT,

        properties = properties

    ) {
//        Marker(
//            state = rememberMarkerState(position = japanLocation),
//            title = "Earthquake",
//            snippet = "Tokyo"
//        )
//
//        Marker(
//            state = rememberMarkerState(position = nepalLocation),
//            title = "Earthquake",
//            snippet = "Kathmandu"
//        )


    }
}


private fun updateCameraPosition(cameraPositionState: CameraPositionState, location: LatLng?) {
    location?.let {
        cameraPositionState.position = CameraPosition.fromLatLngZoom(it, 0f)
    }
}


@SuppressLint("MissingPermission")
private fun getCurrentLocation(
    fusedLocationClient: FusedLocationProviderClient, onLocationReceived: (Location) -> Unit
) {
    fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
        location?.let {
            onLocationReceived(it)
        }
    }
}
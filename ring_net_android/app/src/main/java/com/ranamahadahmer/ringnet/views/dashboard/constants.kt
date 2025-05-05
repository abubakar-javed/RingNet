package com.ranamahadahmer.ringnet.views.dashboard

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AcUnit
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.DeviceThermostat
import androidx.compose.material.icons.filled.Flood
import androidx.compose.material.icons.filled.LensBlur
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Thunderstorm
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.Waves
import androidx.compose.material.icons.outlined.Cloud
import androidx.compose.material.icons.outlined.WaterDrop
import androidx.compose.material.icons.outlined.WbSunny
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

object HazardDecorations {
    val hazardBgColors = mapOf<String, Color>(
        "Earthquake" to Color(0xFFF87171),
        "Flood" to Color(0xFF60A5FA),
        "Heatwave" to Color(0xFFFDCE10),
        "Tsunami" to Color(0x952D5686)
    )
    val hazardIcons = mapOf<String, ImageVector>(
        "Earthquake" to Icons.Default.Public,
        "Flood" to Icons.Default.Flood,
        "Heatwave" to Icons.Default.DeviceThermostat,
        "Tsunami" to Icons.Default.Waves
    )
    val hazardSeverityColor = mapOf<String, Color>(
        "error" to Color(0xFFF87171),
        "warning" to Color(0xFF60A5FA),
        "info" to Color(0xFF24AC01),
    )

    val hazardSeverityText = mapOf<String, String>(
        "error" to "High",
        "warning" to "Medium",
        "info" to "Low",
    )
    val weatherForecastIcons = mapOf<String, ImageVector>(
        "clear sky" to Icons.Outlined.WbSunny,
        "few clouds" to Icons.Outlined.Cloud,
        "broken clouds" to Icons.Outlined.Cloud,
        "scattered clouds" to Icons.Outlined.Cloud,
        "overcast clouds" to Icons.Filled.Cloud,
        "light rain" to Icons.Outlined.WaterDrop,
        "shower rain" to Icons.Outlined.WaterDrop,
        "rain" to Icons.Filled.WaterDrop,
        "heavy rain" to Icons.Filled.WaterDrop,
        "thunderstorm" to Icons.Filled.Thunderstorm,
        "snow" to Icons.Default.AcUnit,
        "mist" to Icons.Default.LensBlur
    )
}
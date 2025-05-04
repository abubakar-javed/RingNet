package com.ranamahadahmer.ringnet.views.dashboard

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeviceThermostat
import androidx.compose.material.icons.filled.Flood
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Waves
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

object HazardDecorations {
    val hazardBgColors = mapOf<String, Color>(
        "Earthquake" to Color(0xFFF87171),
        "Flood" to Color(0xFF60A5FA),
        "Heatwave" to Color(0xFFFACC15),
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
        "warning" to Color(0xFFFACC15),
        "info" to Color(0xFF60A5FA),
    )

    val hazardSeverityText = mapOf<String, String>(
        "error" to "High",
        "warning" to "Medium",
        "info" to "Low",
    )
}
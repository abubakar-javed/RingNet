package com.ranamahadahmer.ringnet.views.dashboard.common

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp


@Composable
fun emptyDataPlaceholder() {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "No data available",
            fontSize = 16.sp,
            color = Color.Gray,
            modifier = Modifier.padding(16.dp)
        )
    }
}

fun formatDateTime(isoDateTime: String): String {
    return try {
        val instant = java.time.Instant.parse(isoDateTime)
        val localDateTime = java.time.LocalDateTime.ofInstant(
            instant,
            java.time.ZoneId.systemDefault()
        )

        val formatter = java.time.format.DateTimeFormatter.ofPattern("MMM d, yyyy - h:mm a")
        localDateTime.format(formatter)
    } catch (e: Exception) {
        isoDateTime // Return original string if parsing fails
    }
}
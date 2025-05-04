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
import java.time.LocalDate
import java.time.format.DateTimeFormatter


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
        isoDateTime
    }
}

fun formatDateToDay(date: String): String {
    return try {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val localDate = LocalDate.parse(date, formatter)
        val outputFormatter = DateTimeFormatter.ofPattern("EEE, MMM d")
        localDate.format(outputFormatter)
    } catch (e: Exception) {
        date
    }
}

fun String.toTitleCase(): String {
    return this.split(" ").joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { char ->
            char.uppercase()
        }
    }
}
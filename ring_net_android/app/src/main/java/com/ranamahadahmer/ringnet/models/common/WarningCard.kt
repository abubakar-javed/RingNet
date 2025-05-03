package com.ranamahadahmer.ringnet.models.common

import androidx.compose.ui.graphics.vector.ImageVector

data class WarningCard(
    val title: String,
    val number: Int,
    val description: String,
    val icon: ImageVector,
)
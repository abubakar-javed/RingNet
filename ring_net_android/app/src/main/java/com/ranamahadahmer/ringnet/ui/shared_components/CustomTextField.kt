package com.ranamahadahmer.ringnet.ui.shared_components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.RemoveRedEye
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

enum class TextFieldType {
    Name,
    Email,
    Password
}

@Composable
fun CustomTextField(icon: ImageVector,
                    placeHolder: String,
                    trailing: @Composable (() -> Unit)? = null,
                    type: TextFieldType) {

    var value by remember { mutableStateOf("") }
    var returnValue by remember { mutableStateOf("") }
    var hidden by remember { mutableStateOf(type == TextFieldType.Password) }
    TextField(
        if (hidden) value else returnValue,
        colors = TextFieldDefaults.colors().copy(
            unfocusedTextColor = Color.Black,
            focusedTextColor = Color.Black,
            focusedPlaceholderColor = Color.Gray,
            unfocusedPlaceholderColor = Color.Gray,
            focusedContainerColor = Color(0xFFE3E1E3),
            unfocusedContainerColor = Color(0xFFE3E1E3),
            focusedLeadingIconColor = Color.Red,
            unfocusedLeadingIconColor = Color.Red,
            focusedTrailingIconColor = Color.Gray,
            unfocusedTrailingIconColor = Color.Gray,
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            cursorColor = Color.Black,
        ),
        trailingIcon = {
            if (type == TextFieldType.Password) {
                Icon(Icons.Outlined.RemoveRedEye,
                    contentDescription = null,
                    modifier = Modifier.clickable {
                        println(hidden)
                        hidden = !hidden
                        println(hidden)
                        println(returnValue)
                        println(value)
                    })
            } else {
                trailing?.invoke()
            }
        },
        singleLine = true,
        leadingIcon = {
            Icon(icon, contentDescription = null)
        },
        onValueChange = {
            returnValue = it
            value = it.map { '*' }.joinToString("")
        },
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text(placeHolder) }
    )
}
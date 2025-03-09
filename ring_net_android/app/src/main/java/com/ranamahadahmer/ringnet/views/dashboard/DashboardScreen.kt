package com.ranamahadahmer.ringnet.views.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.ranamahadahmer.ringnet.view_models.P2pModel


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    modifier: Modifier = Modifier,
    userId: String,
    model: P2pModel
) {
    model.startWorking()

    val messages by model.messages.collectAsState(initial = emptyList())
    val peers by model.peers.collectAsState()
    var messageText by remember { mutableStateOf("") }

    Scaffold(
        contentWindowInsets = WindowInsets.ime,
        topBar = {
            Column {
                CenterAlignedTopAppBar(
                    title = { Text(text = "P2P Demo") }
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Column {
                        Text(text = "User ID: $userId")
                        Text(text = "Peers: $peers")
                    }


                }
                HorizontalDivider()
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { msg ->
                    MessageBubble(
                        message = msg,
                        isSentByUser = msg.startsWith("You") // Example to distinguish sent/received
                    )
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    label = { Text(text = "Enter message") },
                    modifier = Modifier.weight(1f),
                    trailingIcon = {
                        IconButton(
                            onClick = {
                                if (messageText.isNotBlank()) {
                                    model.sendMessage(messageText)
                                    messageText = ""
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "Send Message"
                            )
                        }
                    }
                )

            }
        }
    }
}

@Composable
fun MessageBubble(message: String, isSentByUser: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
        horizontalArrangement = if (isSentByUser) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .background(
                    if (isSentByUser) Color.Gray else Color.DarkGray,
                    shape = RoundedCornerShape(8.dp)
                )
                .padding(vertical = 8.dp, horizontal = 12.dp)
        ) {
            Text(
                text = if (isSentByUser) message.replace("You: ", "") else message,

                )
        }
    }
}







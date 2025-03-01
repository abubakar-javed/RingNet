package com.ranamahadahmer.ringnet.views.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.ranamahadahmer.ringnet.view_models.P2pModel


@Composable
fun DashboardScreen(modifier: Modifier = Modifier,message:String
                    ,model: P2pModel
) {
    model.startWorking()
    Scaffold(modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize().padding(it),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(32.dp,
                alignment = Alignment.CenterVertically)) {
            Text(text = "Dashboard")
            Text(text = "Message: $message")
        }
    }
}


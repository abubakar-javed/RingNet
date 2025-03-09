package com.ranamahadahmer.ringnet.views.dashboard

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.view_models.P2pModel

data class Earthquake(
    val location: String,
    val dateTime: String,
    val magnitude: Double,
)

val earthquakes = listOf(Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
    Earthquake("Oklahoma","Dec 17,2024 - 07:05:32", 7.5),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LandingScreen(
    modifier: Modifier = Modifier,

) {

    Scaffold(
        contentWindowInsets = WindowInsets.systemBars,
        modifier = modifier.background(Color.White),
        topBar = {
                TopAppBar(

                    title = {
                        Row(modifier = Modifier.background(Color.Transparent).fillMaxWidth(),verticalAlignment = Alignment.CenterVertically) {
                            Image(
                                painter = painterResource(R.drawable.icon),
                                contentDescription =null,
                                contentScale = ContentScale.Crop,            // crop the image if it's not a square
                                modifier = Modifier.height(45.dp).width(45.dp)           // set the image height
                                        .clip(CircleShape)                       // clip to the circle shape
                                        .border(2.dp, Color.Gray, CircleShape)   // add a border (optional)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(verticalArrangement = Arrangement.Center) {
                                Text(text = "Hello, Mahad", fontSize = 20.sp)
                                Text(text = "Islamabad, Pakistan", fontSize = 14.sp)
                            }
                        }

                    },
                    actions = {
                        IconButton(onClick = { /*TODO*/ }) {
                            Icon(Icons.Default.Notifications, contentDescription = null)
                        }
                    }
                )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(paddingValues).padding(horizontal = 16.dp, vertical = 16.dp)
        ) {

            Column (
                modifier = Modifier
                        .fillMaxWidth()
                        .weight(0.6f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFAF1616)),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("No earthquake recorded in your area today", color = Color.White, fontSize = 20.sp,textAlign = TextAlign.Center)
            }
            Spacer(modifier = Modifier.height(16.dp))
            Column (
                modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
            ) {
                Row(modifier = Modifier.fillMaxWidth()
                    ,horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Recent Earthquakes",color = Color.Black, fontWeight = FontWeight.Bold)
                    Text("See All", color = Color(0xFFAF1616)) }

                LazyColumn {
                    items(earthquakes) { earthquake ->
                        Row(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                            Column (
                                modifier = Modifier
                                        .height(50.dp).width(50.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFAF1616)),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text(text = earthquake.magnitude.toString(), fontSize = 20.sp, color = Color.White)
                            }
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(verticalArrangement = Arrangement.Center) {
                                Text(text =earthquake.location, fontSize = 20.sp, color = Color.Black)
                                Text(text = earthquake.dateTime, fontSize = 14.sp, color = Color.Black)
                            }
                        }
                        HorizontalDivider()
                    }
                }


            }
            Spacer(modifier = Modifier.height(16.dp))
            Column (
                modifier = Modifier
                        .fillMaxWidth()
                        .weight(0.5f)
                        .clip(RoundedCornerShape(10.dp))

            ) {
                Row(modifier = Modifier.fillMaxWidth()
                    ,horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("News",color = Color.Black, fontWeight = FontWeight.Bold)
                    Text("See All", color = Color(0xFFAF1616)) }

                Row(modifier = Modifier.fillMaxWidth().background(Color(0xFF9F1616)).clip(RoundedCornerShape(10.dp)) ) {

                    Image(
                        painter = painterResource(R.drawable.earthquake),
                        contentDescription =null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.height(45.dp).width(45.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .border(2.dp, Color.Gray, RoundedCornerShape(10.dp))
                    )
                    Column(
                        modifier = Modifier.padding(8.dp),
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("Earthquake in Pakistan", fontSize = 20.sp, color = Color.White)
                        Text("A 7.5 magnitude earthquake hit Pakistan", fontSize = 14.sp, color = Color.White)
                    }

            }
        }
    }
}}








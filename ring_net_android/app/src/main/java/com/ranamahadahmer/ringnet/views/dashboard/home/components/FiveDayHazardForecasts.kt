package com.ranamahadahmer.ringnet.views.dashboard.home.components

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Public
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations
import java.time.LocalDate
import java.time.format.DateTimeFormatter


@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun FiveDayHazardForecasts(modifier: Modifier) {
    Column {
        Text(
            modifier = modifier,
            text = "5-Day Forecast",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))
        TodayWarningCard(modifier)
        Spacer(modifier = Modifier.height(16.dp))

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(horizontal = 8.dp)
        ) {
            items(getMockForecasts()) { forecast ->
                HazardCard(forecast)
            }
        }
    }
}

@Composable
fun TodayWarningCard(modifier: Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(255, 218, 218, 255)),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Column(modifier = Modifier.weight(1.5f)) {
                Text("Today", fontWeight = FontWeight.Bold, fontSize = 24.sp)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Public,
                        contentDescription = "Warning",
                        tint = Color.Red
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "No Seismic Activity",
                        fontWeight = FontWeight.Bold,
                        color = Color.Red
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Magnitude: 0 ",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Depth: -",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "21°",
                    fontWeight = FontWeight.Bold,
                    fontSize = 32.sp,
                    textAlign = TextAlign.End
                )
                Box(
                    modifier = Modifier
                        .background(Color.Red, shape = RoundedCornerShape(4.dp))
                        .padding(4.dp)
                ) {
                    Text(text = "No Risk", color = Color.White, fontSize = 12.sp)
                }

            }
        }
    }
}

@Composable
fun HazardCard(forecast: HazardForecast) {
    Card(
        modifier = Modifier.width(180.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors().copy(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(text = forecast.date, fontWeight = FontWeight.Bold)

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .background(
                        HazardDecorations.hazardBgColors.getValue(forecast.type),
                        shape = RoundedCornerShape(4.dp)
                    )
                    .padding(4.dp)
            ) {
                Icon(
                    imageVector = HazardDecorations.hazardIcons.getValue(forecast.type),
                    contentDescription = forecast.description,

                    )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(text = "${forecast.temperature}°", fontWeight = FontWeight.Bold, fontSize = 20.sp)

            Spacer(modifier = Modifier.height(4.dp))

            Text(text = forecast.description, fontSize = 14.sp, color = Color.Gray)
        }
    }
}

// Mock Data
data class HazardForecast(
    val date: String,
    val temperature: Int,
    val description: String,
    val type: String
)


@RequiresApi(Build.VERSION_CODES.O)
fun getMockForecasts(): List<HazardForecast> {
    val formatter = DateTimeFormatter.ofPattern("EEE, MMM dd")


    return listOf(
        HazardForecast(
            LocalDate.now().plusDays(1).format(formatter),
            21,
            "Pleasant Weather",
            type = "Heatwave",
        ),
        HazardForecast(
            LocalDate.now().plusDays(2).format(formatter),
            21,
            "Pleasant Weather",
            type = "Heatwave",
        ),
        HazardForecast(
            LocalDate.now().plusDays(3).format(formatter),
            23,
            "Pleasant Weather",
            type = "Heatwave"
        ),
        HazardForecast(
            LocalDate.now().plusDays(4).format(formatter),
            24,
            "Pleasant Weather",
            type = "Heatwave",
        )
    )
}


@RequiresApi(Build.VERSION_CODES.O)
@Preview
@Composable
fun FiveDayHazardForecastsPreview() {
    FiveDayHazardForecasts(Modifier.padding(8.dp))
}
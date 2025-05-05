package com.ranamahadahmer.ringnet.views.dashboard.home.components


import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ranamahadahmer.ringnet.models.WeatherForecast
import com.ranamahadahmer.ringnet.models.WeatherForecastResponse
import com.ranamahadahmer.ringnet.view_models.AppViewModel
import com.ranamahadahmer.ringnet.views.dashboard.HazardDecorations
import com.ranamahadahmer.ringnet.views.dashboard.common.formatDateToDay
import com.ranamahadahmer.ringnet.views.dashboard.common.toTitleCase
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit


@Composable
fun FiveDayWeatherForecasts(modifier: Modifier, viewModel: AppViewModel) {
    val weatherForecast = viewModel.weatherForecast.collectAsState()
    Column {
        Text(
            modifier = modifier,
            text = "5-Day Forecast",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        when (weatherForecast.value) {
            is WeatherForecastResponse.Loading -> {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }

            is WeatherForecastResponse.Error -> {
                Text(text = "Error: ${(weatherForecast.value as WeatherForecastResponse.Error).message}")
            }

            is WeatherForecastResponse.Success -> {
                val forecasts =
                    (weatherForecast.value as WeatherForecastResponse.Success).metadata.forecast

                TodayWarningCard(modifier, viewModel)
                Spacer(modifier = Modifier.height(16.dp))

                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    items(forecasts.takeLast(4)) { forecast ->
                        HazardCard(forecast)

                    }
                }
            }

            WeatherForecastResponse.Initial -> {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
        }
    }
}

@Composable
fun TodayWarningCard(modifier: Modifier, viewModel: AppViewModel) {
    val weatherForecast = viewModel.weatherForecast.collectAsState()
    val locationDetails = viewModel.locationDetails.collectAsState()

    val timeDifference = when (weatherForecast.value) {
        is WeatherForecastResponse.Success -> {
            val updatedAt = (weatherForecast.value as WeatherForecastResponse.Success).updatedAt
            val formatter = DateTimeFormatter.ISO_DATE_TIME
            val updatedDateTime = LocalDateTime.parse(updatedAt, formatter)
            val currentDateTime = LocalDateTime.now(ZoneOffset.UTC)
            ChronoUnit.MINUTES.between(updatedDateTime, currentDateTime)
        }

        else -> 0
    }

    Card(
        colors = CardDefaults.cardColors(

            containerColor = Color.White
        ),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {

                Column {
                    Text("Today", fontWeight = FontWeight.Bold, fontSize = 24.sp)

                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = locationDetails.value.joinToString(", "),
                        fontSize = 16.sp,
                        color = Color.Gray
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = "$timeDifference Minutes Ago",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                Column(

                    verticalArrangement = Arrangement.SpaceBetween,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = HazardDecorations.weatherForecastIcons.getValue((weatherForecast.value as WeatherForecastResponse.Success).description),
                        contentDescription = null,
                        tint = Color.Red,
                        modifier = Modifier.size(42.dp)
                    )
                    Text(
                        text = "${(weatherForecast.value as WeatherForecastResponse.Success).temperature.toInt()}°C",
                        fontWeight = FontWeight.Bold,
                        fontSize = 32.sp,

                        )
                    Text(
                        text = (weatherForecast.value as WeatherForecastResponse.Success).description.toTitleCase(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                    )
                    Text(
                        text = "Feels like ${(weatherForecast.value as WeatherForecastResponse.Success).feelsLike.toInt()}°C",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
            }
            HorizontalDivider(thickness = 2.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TodayParameters(
                    icon = Icons.Default.Thermostat,
                    title = "Temperature",
                    value = "${(weatherForecast.value as WeatherForecastResponse.Success).temperature}°C"
                )
                TodayParameters(
                    icon = Icons.Default.WaterDrop,
                    title = "Humidity",
                    value = "${(weatherForecast.value as WeatherForecastResponse.Success).humidity}%"
                )
                TodayParameters(
                    icon = Icons.Default.Air,
                    title = "Wind Speed",
                    value = "${(weatherForecast.value as WeatherForecastResponse.Success).windSpeed} m/s"
                )

            }
        }

    }
}


@Composable
fun TodayParameters(icon: ImageVector, title: String, value: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.Red,
            modifier = Modifier.size(24.dp)
        )

        Spacer(Modifier.height(4.dp))
        Text(
            text = title,
            fontSize = 14.sp,
            color = Color.Gray
        )
        Spacer(Modifier.height(4.dp))

        Text(
            text = value,
            fontSize = 16.sp,
            color = Color.Gray
        )


    }
}

@Composable
fun HazardCard(forecast: WeatherForecast) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors().copy(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Text(
                text = formatDateToDay(forecast.date),
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Icon(
                imageVector = HazardDecorations.weatherForecastIcons.getValue(forecast.description),
                contentDescription = forecast.description,
            )


            Spacer(modifier = Modifier.height(8.dp))


            Text(text = "${forecast.temperature}°C", fontWeight = FontWeight.Bold, fontSize = 20.sp)

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = forecast.description.toTitleCase(), fontSize = 14.sp, color = Color.Gray
            )
            if (forecast.isHeatwave) {
                Text(
                    text = "Heatwave Alert",
                    fontSize = 14.sp,
                    color = Color.Red,
                    fontWeight = FontWeight.Bold
                )

            }
        }
    }
}



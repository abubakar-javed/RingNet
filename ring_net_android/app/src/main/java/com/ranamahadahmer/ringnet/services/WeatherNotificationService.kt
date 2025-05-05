package com.ranamahadahmer.ringnet.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.ranamahadahmer.ringnet.MainActivity
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.models.NotificationInfo
import com.ranamahadahmer.ringnet.models.UserNotificationResponse

class WeatherNotificationService : Service() {
    private val CHANNEL_ID = "WeatherNotifications"
    private val FOREGROUND_SERVICE_ID = 101

    override fun onBind(intent: Intent?): IBinder? = null


    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(FOREGROUND_SERVICE_ID, createForegroundNotification())
    }

    //    private fun createForegroundNotification(): android.app.Notification {
//        val notificationIntent = Intent(this, MainActivity::class.java)
//        val pendingIntent = PendingIntent.getActivity(
//            this, 0, notificationIntent,
//            PendingIntent.FLAG_IMMUTABLE
//        )
//
//        return NotificationCompat.Builder(this, CHANNEL_ID)
//            .setContentTitle("Weather Monitoring Active")
//            .setContentText("Monitoring for weather alerts")
//            .setSmallIcon(R.drawable.icon)
//            .setContentIntent(pendingIntent)
//            .build()
//    }
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Weather Notifications",
                importance
            ).apply {
                description = "Channel for weather alerts and notifications"
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }

    }


    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "SHOW_NOTIFICATION" -> {
                val notification = intent.getParcelableExtra<NotificationInfo>("notification")
                notification?.let { showNotification(it) }
            }

            "UPDATE_NOTIFICATIONS" -> {
                val notifications = when (val response =
                    intent.getParcelableExtra<UserNotificationResponse>("notifications")) {
                    is UserNotificationResponse.Success -> response.notifications
                    else -> emptyList()
                }
                updateNotifications(notifications)
            }

            "NOTIFICATION_DISMISSED" -> {
                // Handle notification dismissal
                val notificationId = intent.getStringExtra("notification_id")
                notificationId?.let { markNotificationAsRead(it) }
            }
        }
        return START_STICKY
    }


    private fun markNotificationAsRead(notificationId: String) {
        val readIntent = Intent("com.ranamahadahmer.ringnet.NOTIFICATION_READ")
        readIntent.putExtra("notification_id", notificationId)
        sendBroadcast(readIntent)
    }


    private fun createForegroundNotification(): android.app.Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Weather Monitoring Active")
            .setContentText("Monitoring for weather alerts")
            .setSmallIcon(R.drawable.icon)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
    }

//    private fun createNotificationChannel() {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            val channel = NotificationChannel(
//                CHANNEL_ID,
//                "Weather Notifications",
//                NotificationManager.IMPORTANCE_DEFAULT
//            ).apply {
//                description = "Channel for weather alerts and notifications"
//            }
//
//            val notificationManager =
//                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//            notificationManager.createNotificationChannel(channel)
//        }
//    }


//    private fun showNotification(notification: NotificationInfo) {
//        val intent = Intent(this, MainActivity::class.java).apply {
//            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//        }
//
//        // Create a delete intent for handling notification dismissal
//        val deleteIntent = Intent(this, WeatherNotificationService::class.java).apply {
//            action = "NOTIFICATION_DISMISSED"
//            putExtra("notification_id", notification.id)
//        }
//        val deletePendingIntent = PendingIntent.getService(
//            this,
//            notification.hashCode(),
//            deleteIntent,
//            PendingIntent.FLAG_IMMUTABLE
//        )
//
//        val pendingIntent = PendingIntent.getActivity(
//            this,
//            0,
//            intent,
//            PendingIntent.FLAG_IMMUTABLE
//        )
//
//        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
//            .setSmallIcon(R.drawable.icon)
//            .setContentTitle(notification.type)
//            .setContentText(notification.message)
//            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
//            .setAutoCancel(true)
//            .setContentIntent(pendingIntent)
//            .setDeleteIntent(deletePendingIntent) // Add delete intent for dismissal
//
//        val notificationManager =
//            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//        notificationManager.notify(notification.hashCode(), builder.build())
//    }

    private fun showNotification(notification: NotificationInfo) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            this, notification.hashCode(), intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.icon)
            .setContentTitle(notification.type)
            .setContentText(notification.message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setDefaults(NotificationCompat.DEFAULT_ALL)

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notification.hashCode(), builder.build())
    }

    //    private fun updateNotifications(notifications: List<NotificationInfo>) {
//        notifications.forEach { notification ->
//            if (notification.status != "Read") {
//                showNotification(notification)
//            }
//        }
//    }
    private fun updateNotifications(notifications: List<NotificationInfo>) {
        notifications.forEach { notification ->
            if (notification.status != "Read") {
                showNotification(notification)
            }
        }
    }
}
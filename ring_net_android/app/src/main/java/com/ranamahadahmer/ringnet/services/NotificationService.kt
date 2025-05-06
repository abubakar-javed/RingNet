package com.ranamahadahmer.ringnet.services


import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import com.ranamahadahmer.ringnet.MainActivity
import com.ranamahadahmer.ringnet.R
import com.ranamahadahmer.ringnet.api.BackendApi
import com.ranamahadahmer.ringnet.api.ReadUserNotificationService
import com.ranamahadahmer.ringnet.api.UserNotificationService
import com.ranamahadahmer.ringnet.models.NotificationInfo
import com.ranamahadahmer.ringnet.models.UserNotificationResponse
import com.ranamahadahmer.ringnet.view_models.AuthViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class NotificationService : LifecycleService() {

    // Binder for clients to access this service
    inner class LocalBinder : Binder() {
        fun getService(): NotificationService = this@NotificationService
    }

    private val binder = LocalBinder()

    override fun onBind(intent: Intent): IBinder {
        super.onBind(intent)
        return binder
    }

    companion object {
        private const val FOREGROUND_SERVICE_ID = 101
        private const val NOTIFICATION_CHANNEL_ID = "ringnet_notifications"
        private const val NOTIFICATION_CHANNEL_NAME = "RingNet Notifications"
        private const val POLLING_INTERVAL_MS = 5 * 60 * 1000L // 5 minutes

        private const val ACTION_NOTIFICATION_DISMISSED =
            "com.ranamahadahmer.ringnet.NOTIFICATION_DISMISSED"
        private const val EXTRA_NOTIFICATION_ID = "notification_id"

        // Triggers the service to start if it's not already running
        fun startService(context: Context) {
            val intent = Intent(context, NotificationService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    private lateinit var notificationManager: NotificationManagerCompat
    private lateinit var authViewModel: AuthViewModel
    private val _userNotificationService =
        BackendApi.retrofit.create(UserNotificationService::class.java)
    private val _readUserNotificationService =
        BackendApi.retrofit.create(ReadUserNotificationService::class.java)

    private val _userNotifications =
        MutableStateFlow<UserNotificationResponse>(UserNotificationResponse.Initial)
    val userNotifications: StateFlow<UserNotificationResponse> = _userNotifications

    private val notificationDismissReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (intent.action == ACTION_NOTIFICATION_DISMISSED) {
                val notificationId = intent.getStringExtra(EXTRA_NOTIFICATION_ID)
                notificationId?.let {
                    markNotificationAsRead(it)
                }
            }
        }
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override fun onCreate() {
        super.onCreate()

        // Initialize components
        notificationManager = NotificationManagerCompat.from(this)
        authViewModel = AuthViewModel(this)

        // Create notification channel for Android O and above
        createNotificationChannel()

        // Register notification dismiss receiver
        registerReceiver(
            notificationDismissReceiver,
            IntentFilter(ACTION_NOTIFICATION_DISMISSED)
        )

        // Start as foreground service with a persistent notification
        startForeground(FOREGROUND_SERVICE_ID, createForegroundNotification())

        // Start polling for notifications
        startPolling()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        return START_STICKY
    }


    override fun onDestroy() {
        unregisterReceiver(notificationDismissReceiver)
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications from RingNet app"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createForegroundNotification(): Notification {
        val pendingIntent: PendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("RingNet")
            .setContentText("Monitoring for notifications")
            .setSmallIcon(R.drawable.icon)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startPolling() {
        lifecycleScope.launch {
            // Wait for auth token to be available
            authViewModel.token.first { it.isNotEmpty() }

            while (true) {
                fetchNotifications()
                delay(POLLING_INTERVAL_MS)
            }
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun fetchNotifications() {
        try {
            val result = withContext(Dispatchers.IO) {
                _userNotificationService.getNotifications(
                    token = "Bearer ${authViewModel.token.value}"
                )
            }

            val currentState = _userNotifications.value
            val newNotifications = when (currentState) {
                is UserNotificationResponse.Success -> {
                    // Find any new notifications not in the current list
                    val existingIds = currentState.notifications.map { it.id }.toSet()
                    result.notifications.filter { !existingIds.contains(it.id) }
                }

                else -> result.notifications
            }

            // Display new notifications
            newNotifications.forEach { notification ->
                if (notification.status != "Read") {
                    showNotification(notification)
                }
            }

            // Update state
            _userNotifications.value = result

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun showNotification(notification: NotificationInfo) {
        // Create a unique notification ID from the notification ID string
        val uniqueId = notification.id.hashCode() and 0xfffffff

        // Create delete intent
        val deleteIntent = Intent(ACTION_NOTIFICATION_DISMISSED).apply {
            putExtra(EXTRA_NOTIFICATION_ID, notification.id)
        }
        val deletePendingIntent = PendingIntent.getBroadcast(
            this,
            uniqueId,
            deleteIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        // Create content intent
        val contentIntent = Intent(this, MainActivity::class.java).apply {
            putExtra("notification_id", notification.id)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            this,
            uniqueId,
            contentIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        // Build notification
        val builder = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.icon)
            .setContentTitle(getSeverityTitle(notification.severity))
            .setContentText(notification.message)
            .setPriority(getSeverityPriority(notification.severity))
            .setContentIntent(contentPendingIntent)
            .setDeleteIntent(deletePendingIntent)
            .setAutoCancel(true)

        // Show notification
        notificationManager.notify(uniqueId, builder.build())
    }

    private fun getSeverityTitle(severity: String): String {
        return when (severity.lowercase()) {
            "high" -> "Urgent Alert"
            "medium" -> "Warning"
            "low" -> "Notice"
            else -> "RingNet Notification"
        }
    }

    private fun getSeverityPriority(severity: String): Int {
        return when (severity.lowercase()) {
            "high" -> NotificationCompat.PRIORITY_HIGH
            "medium" -> NotificationCompat.PRIORITY_DEFAULT
            "low" -> NotificationCompat.PRIORITY_LOW
            else -> NotificationCompat.PRIORITY_DEFAULT
        }
    }

    private fun markNotificationAsRead(notificationId: String) {
        lifecycleScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    _readUserNotificationService.readNotification(
                        token = "Bearer ${authViewModel.token.value}",
                        notificationId = notificationId
                    )
                }

                // Update local state
                val currentState = _userNotifications.value
                if (currentState is UserNotificationResponse.Success) {
                    val updatedNotifications = currentState.notifications.map {
                        if (it.id == notificationId) it.copy(status = "Read") else it
                    }
                    _userNotifications.value =
                        currentState.copy(notifications = updatedNotifications)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}



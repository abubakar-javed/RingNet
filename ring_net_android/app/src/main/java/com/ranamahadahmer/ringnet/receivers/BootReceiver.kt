package com.ranamahadahmer.ringnet.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.ranamahadahmer.ringnet.database.DataStoreManager
import com.ranamahadahmer.ringnet.services.NotificationService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            println("Starting NotificationService after boot completed")
            CoroutineScope(Dispatchers.IO).launch {
                // Check if user is logged in
                val dataStoreManager = DataStoreManager(context)
                val token = dataStoreManager.token.first()
                val userId = dataStoreManager.userId.first()

                if (!token.isNullOrEmpty() && !userId.isNullOrEmpty()) {
                    // Start the notification service
                    NotificationService.Companion.startService(context)
                }
            }
        }
    }
}
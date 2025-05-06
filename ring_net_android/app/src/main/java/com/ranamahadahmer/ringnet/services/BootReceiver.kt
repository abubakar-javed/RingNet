package com.ranamahadahmer.ringnet.services


import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.ranamahadahmer.ringnet.database.DataStoreManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            CoroutineScope(Dispatchers.IO).launch {
                // Check if user is logged in
                val dataStoreManager = DataStoreManager(context)
                val token = dataStoreManager.token.first()
                val userId = dataStoreManager.userId.first()

                if (!token.isNullOrEmpty() && !userId.isNullOrEmpty()) {
                    // Start the notification service
                    NotificationService.startService(context)
                }
            }
        }
    }
}
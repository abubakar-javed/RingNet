package com.ranamahadahmer.ringnet.view_models

import android.app.Application
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.nsd.NsdManager
import androidx.core.app.NotificationCompat
import androidx.core.app.TaskStackBuilder
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ranamahadahmer.ringnet.MainActivity
import com.ranamahadahmer.ringnet.R
//import com.ranamahadahmer.ringnet.User
import com.ranamahadahmer.ringnet.database.DataStoreManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import nl.tudelft.ipv8.Community
import nl.tudelft.ipv8.IPv8Configuration
import nl.tudelft.ipv8.Overlay
import nl.tudelft.ipv8.OverlayConfiguration
import nl.tudelft.ipv8.android.IPv8Android
import nl.tudelft.ipv8.android.keyvault.AndroidCryptoProvider
import nl.tudelft.ipv8.android.peerdiscovery.NetworkServiceDiscovery
import nl.tudelft.ipv8.android.service.IPv8Service
import nl.tudelft.ipv8.keyvault.PrivateKey
import nl.tudelft.ipv8.messaging.Deserializable
import nl.tudelft.ipv8.messaging.Packet
import nl.tudelft.ipv8.messaging.Serializable
import nl.tudelft.ipv8.peerdiscovery.DiscoveryCommunity
import nl.tudelft.ipv8.peerdiscovery.strategy.PeriodicSimilarity
import nl.tudelft.ipv8.peerdiscovery.strategy.RandomChurn
import nl.tudelft.ipv8.peerdiscovery.strategy.RandomWalk
import nl.tudelft.ipv8.util.toHex


class MyMessage(val message: String) : Serializable {
    override fun serialize(): ByteArray {
        return message.toByteArray(Charsets.UTF_8)
    }

    companion object Deserializer : Deserializable<MyMessage> {
        override fun deserialize(buffer: ByteArray, offset: Int): Pair<MyMessage, Int> {
            // Use the offset to ensure we read from the correct part of the buffer
            val messageString = String(buffer, offset, buffer.size - offset, Charsets.UTF_8)
            return Pair(MyMessage(messageString), buffer.size)
        }
    }
}

class DemoCommunity : Community() {
    val messages = MutableStateFlow<List<String>>(emptyList())
    override val serviceId = "02313685c1912a141279f8248fc8db5899c5df5a"

    init {
        messageHandlers[1] = ::onMessage
    }

    private fun onMessage(packet: Packet) {
        val (peer, payload) = packet.getAuthPayload(MyMessage.Deserializer)
        messages.value += "${peer.address}: ${payload.message}"
        println("MSG: Received")

    }

    fun sendMessage(msg: String) {
        val packet = serializePacket(1, MyMessage(msg))
        messages.value += "You: $msg"
        for (peer in getPeerss()) {
            send(peer.address, packet)
        }
    }


}

class DemoService : IPv8Service() {

    override fun onCreate() {
        super.onCreate()
        scope.launch {
            while (true) {
                updateNotification()
                delay(1000)
            }
        }
    }

    override fun createNotification(): NotificationCompat.Builder {
        val trustChainDashboardIntent = Intent(this, MainActivity::class.java)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pendingIntent =
            TaskStackBuilder.create(this)
                .addNextIntentWithParentStack(trustChainDashboardIntent)
                .getPendingIntent(0, flags)

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_CONNECTION)
            .setContentTitle("IPv8 Service")
            .setContentText("Connected to ${IPv8Android.getInstance().network.verifiedPeers.size} peers")
            .setSmallIcon(R.drawable.icon)
            .setColor(getColor(R.color.black))
            .setContentIntent(pendingIntent)
            .setOnlyAlertOnce(true)
    }
}

class P2pModel(context: Application) : ViewModel() {
    val dataStoreManager = DataStoreManager(context = context.applicationContext)


    private var community: DemoCommunity? = null
    val peers = MutableStateFlow(0)
    val messages: StateFlow<List<String>> get() = community!!.messages


    private fun getPrivateKey(): PrivateKey {

        val privateKey = AndroidCryptoProvider.generateKey()

        viewModelScope.launch {
            dataStoreManager.insertKey(privateKey.keyToBin().toHex())
        }


        return privateKey
    }


    init {
        println("P2PModel")
        try {
            val demoCommunity = OverlayConfiguration(
                factory = Overlay.Factory(DemoCommunity::class.java),
                walkers = listOf(RandomWalk.Factory()),
                maxPeers = 30
            )
            val config =
                IPv8Configuration(
                    overlays = listOf(
                        demoCommunity,
                        createDiscoveryCommunity(context.applicationContext)
                    ),
                    walkerInterval = 5.0
                )
            IPv8Android.Factory(context)
                .setConfiguration(config)
                .setPrivateKey(getPrivateKey())
                .setServiceClass(DemoService::class.java)
                .init()
            println("IPv8Android")
        } catch (e: Exception) {
            println("Error in Model init = ${e.message}")
        }
        println("P2PModel")
    }

    fun sendMessage(msg: String) {
        community!!.sendMessage(msg)
    }

    fun startWorking() {
        try {
            println("HERE")
            val ipv8 = IPv8Android.getInstance()
            println("HERE 2")
            community = ipv8.getOverlay<DemoCommunity>()!!
            viewModelScope.launch {
                while (isActive) {
                    peers.value = community!!.getPeerss().size
                    delay(1000)
                }
            }
        } catch (e: Exception) {
            println("Error in start working model ${e.message}")
        }
    }
}


private fun createDiscoveryCommunity(context: Context): OverlayConfiguration<DiscoveryCommunity> {
    val randomWalk = RandomWalk.Factory()
    val randomChurn = RandomChurn.Factory()
    val periodicSimilarity = PeriodicSimilarity.Factory()

    val nsd =
        NetworkServiceDiscovery.Factory((context.getSystemService(Context.NSD_SERVICE) as NsdManager))
//    val bluetoothManager =
//        getSystemService<BluetoothManager>()
//            ?: throw IllegalStateException("BluetoothManager not available")
    val strategies =
        mutableListOf(
            randomWalk,
            randomChurn,
            periodicSimilarity,
            nsd
        )
//    if (bluetoothManager.adapter != null) {
//        val ble = BluetoothLeDiscovery.Factory()
//        strategies += ble
//    }

    return OverlayConfiguration(
        DiscoveryCommunity.Factory(),
        strategies
    )
}
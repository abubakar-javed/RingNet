package com.ranamahadahmer.ringnet.models

import org.junit.Test
import org.junit.Assert.*

class UserNotificationResponseTest {

    @Test
    fun `test UserNotificationResponse Initial state`() {
        val response = UserNotificationResponse.Initial
        assertTrue(response is UserNotificationResponse.Initial)
    }

    @Test
    fun `test UserNotificationResponse Loading state`() {
        val response = UserNotificationResponse.Loading
        assertTrue(response is UserNotificationResponse.Loading)
    }

    @Test
    fun `test UserNotificationResponse Success state`() {
        val notifications = listOf(
            NotificationInfo(
                id = "1",
                notificationId = "N1",
                alertId = "A1",
                hazardId = "H1",
                hazardModel = "Flooding",
                type = "ALERT",
                severity = "HIGH",
                location = "Test Location",
                impactRadius = 1000,
                sentAt = "2023-10-20T12:00:00Z",
                status = "Unread",
                message = "Test notification message",
                recipients = listOf("user1", "user2"),
                createdAt = "2023-10-20T12:00:00Z",
                updatedAt = "2023-10-20T12:00:00Z",
                version = 1
            )
        )
        
        val total = 1
        val page = 1
        val totalPages = 1
        
        val response = UserNotificationResponse.Success(
            notifications = notifications,
            total = total,
            page = page,
            totalPages = totalPages
        )
        
        assertTrue(response is UserNotificationResponse.Success)
        assertEquals(notifications, response.notifications)
        assertEquals(total, response.total)
        assertEquals(page, response.page)
        assertEquals(totalPages, response.totalPages)
    }

    @Test
    fun `test UserNotificationResponse Error state`() {
        val errorMessage = "Failed to fetch notifications"
        val response = UserNotificationResponse.Error(errorMessage)
        
        assertTrue(response is UserNotificationResponse.Error)
        assertEquals(errorMessage, response.message)
    }
}

class NotificationInfoTest {

    @Test
    fun `test NotificationInfo properties`() {
        val id = "1"
        val notificationId = "N1"
        val alertId = "A1"
        val hazardId = "H1"
        val hazardModel = "Flooding"
        val type = "ALERT"
        val severity = "HIGH"
        val location = "Test Location"
        val impactRadius = 1000
        val sentAt = "2023-10-20T12:00:00Z"
        val status = "Unread"
        val message = "Test notification message"
        val recipients = listOf("user1", "user2")
        val createdAt = "2023-10-20T12:00:00Z"
        val updatedAt = "2023-10-20T12:00:00Z"
        val version = 1
        
        val notification = NotificationInfo(
            id = id,
            notificationId = notificationId,
            alertId = alertId,
            hazardId = hazardId,
            hazardModel = hazardModel,
            type = type,
            severity = severity,
            location = location,
            impactRadius = impactRadius,
            sentAt = sentAt,
            status = status,
            message = message,
            recipients = recipients,
            createdAt = createdAt,
            updatedAt = updatedAt,
            version = version
        )
        
        assertEquals(id, notification.id)
        assertEquals(notificationId, notification.notificationId)
        assertEquals(alertId, notification.alertId)
        assertEquals(hazardId, notification.hazardId)
        assertEquals(hazardModel, notification.hazardModel)
        assertEquals(type, notification.type)
        assertEquals(severity, notification.severity)
        assertEquals(location, notification.location)
        assertEquals(impactRadius, notification.impactRadius)
        assertEquals(sentAt, notification.sentAt)
        assertEquals(status, notification.status)
        assertEquals(message, notification.message)
        assertEquals(recipients, notification.recipients)
        assertEquals(createdAt, notification.createdAt)
        assertEquals(updatedAt, notification.updatedAt)
        assertEquals(version, notification.version)
    }
    
    @Test
    fun `test NotificationInfo equality`() {
        val notification1 = NotificationInfo(
            id = "1",
            notificationId = "N1",
            alertId = "A1",
            hazardId = "H1",
            hazardModel = "Flooding",
            type = "ALERT",
            severity = "HIGH",
            location = "Test Location",
            impactRadius = 1000,
            sentAt = "2023-10-20T12:00:00Z",
            status = "Unread",
            message = "Test notification message",
            recipients = listOf("user1", "user2"),
            createdAt = "2023-10-20T12:00:00Z",
            updatedAt = "2023-10-20T12:00:00Z",
            version = 1
        )
        
        val notification2 = NotificationInfo(
            id = "1",
            notificationId = "N1",
            alertId = "A1",
            hazardId = "H1",
            hazardModel = "Flooding",
            type = "ALERT",
            severity = "HIGH",
            location = "Test Location",
            impactRadius = 1000,
            sentAt = "2023-10-20T12:00:00Z",
            status = "Unread",
            message = "Test notification message",
            recipients = listOf("user1", "user2"),
            createdAt = "2023-10-20T12:00:00Z",
            updatedAt = "2023-10-20T12:00:00Z",
            version = 1
        )
        
        val differentNotification = NotificationInfo(
            id = "2",  // Different ID
            notificationId = "N1",
            alertId = "A1",
            hazardId = "H1",
            hazardModel = "Flooding",
            type = "ALERT",
            severity = "HIGH",
            location = "Test Location",
            impactRadius = 1000,
            sentAt = "2023-10-20T12:00:00Z",
            status = "Unread",
            message = "Test notification message",
            recipients = listOf("user1", "user2"),
            createdAt = "2023-10-20T12:00:00Z",
            updatedAt = "2023-10-20T12:00:00Z",
            version = 1
        )
        
        assertEquals(notification1, notification2)
        assertNotEquals(notification1, differentNotification)
    }
} 
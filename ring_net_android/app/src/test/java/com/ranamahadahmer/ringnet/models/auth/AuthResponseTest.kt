package com.ranamahadahmer.ringnet.models.auth

import org.junit.Test
import org.junit.Assert.*

class AuthResponseTest {

    @Test
    fun `test AuthResponse Initial state`() {
        val response = AuthResponse.Initial
        assertTrue(response is AuthResponse.Initial)
    }

    @Test
    fun `test AuthResponse Loading state`() {
        val response = AuthResponse.Loading
        assertTrue(response is AuthResponse.Loading)
    }

    @Test
    fun `test AuthResponse Success state`() {
        val message = "Login successful"
        val token = "test-token-123"
        val userId = "user-123"
        
        val response = AuthResponse.Success(message, token, userId)
        
        assertTrue(response is AuthResponse.Success)
        assertEquals(message, response.message)
        assertEquals(token, response.token)
        assertEquals(userId, response.userId)
    }

    @Test
    fun `test AuthResponse Error state`() {
        val errorMessage = "Invalid credentials"
        val response = AuthResponse.Error(errorMessage)
        
        assertTrue(response is AuthResponse.Error)
        assertEquals(errorMessage, response.message)
    }
    
    @Test
    fun `test AuthResponse equality`() {
        val success1 = AuthResponse.Success("Success", "token-123", "user-123")
        val success2 = AuthResponse.Success("Success", "token-123", "user-123")
        val differentSuccess = AuthResponse.Success("Different", "token-123", "user-123")
        
        assertEquals(success1, success2)
        assertNotEquals(success1, differentSuccess)
        
        val error1 = AuthResponse.Error("Error message")
        val error2 = AuthResponse.Error("Error message")
        val differentError = AuthResponse.Error("Different error")
        
        assertEquals(error1, error2)
        assertNotEquals(error1, differentError)
    }
} 
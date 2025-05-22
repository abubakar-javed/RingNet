package com.ranamahadahmer.ringnet.models.auth

import org.junit.Test
import org.junit.Assert.*

class SignUpRequestBodyTest {

    @Test
    fun `test SignUpRequestBody properties`() {
        val name = "Test User"
        val email = "test@example.com"
        val password = "password123"
        
        val requestBody = SignUpRequestBody(name, email, password)
        
        assertEquals(name, requestBody.name)
        assertEquals(email, requestBody.email)
        assertEquals(password, requestBody.password)
    }
    
    @Test
    fun `test SignUpRequestBody equality`() {
        val request1 = SignUpRequestBody("Test User", "user@example.com", "password123")
        val request2 = SignUpRequestBody("Test User", "user@example.com", "password123")
        val differentRequest = SignUpRequestBody("Other User", "user@example.com", "password123")
        
        assertEquals(request1, request2)
        assertNotEquals(request1, differentRequest)
    }
} 
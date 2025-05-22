package com.ranamahadahmer.ringnet.models.auth

import org.junit.Test
import org.junit.Assert.*

class SignInRequestBodyTest {

    @Test
    fun `test SignInRequestBody properties`() {
        val email = "test@example.com"
        val password = "password123"
        
        val requestBody = SignInRequestBody(email, password)
        
        assertEquals(email, requestBody.email)
        assertEquals(password, requestBody.password)
    }
    
    @Test
    fun `test SignInRequestBody equality`() {
        val request1 = SignInRequestBody("user@example.com", "password123")
        val request2 = SignInRequestBody("user@example.com", "password123")
        val differentRequest = SignInRequestBody("other@example.com", "password123")
        
        assertEquals(request1, request2)
        assertNotEquals(request1, differentRequest)
    }
} 
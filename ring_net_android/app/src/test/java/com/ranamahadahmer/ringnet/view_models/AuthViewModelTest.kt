package com.ranamahadahmer.ringnet.view_models

import android.content.Context
import com.ranamahadahmer.ringnet.api.auth.SignInService
import com.ranamahadahmer.ringnet.api.auth.SignUpService
import com.ranamahadahmer.ringnet.database.DataStoreManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations

@ExperimentalCoroutinesApi
class AuthViewModelTest {

    @Mock
    private lateinit var mockContext: Context

    @Mock
    private lateinit var mockDataStoreManager: DataStoreManager

    @Mock
    private lateinit var mockSignInService: SignInService

    @Mock
    private lateinit var mockSignUpService: SignUpService

    private lateinit var viewModel: AuthViewModel

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        Dispatchers.setMain(testDispatcher)

        // Mock DataStoreManager behavior
        `when`(mockDataStoreManager.token).thenReturn(flowOf(null))
        `when`(mockDataStoreManager.userId).thenReturn(flowOf(null))

        // Create the view model with mocked dependencies
        // Note: In a real test implementation, we would inject these mocks into the view model
        // Since the actual AuthViewModel doesn't support constructor injection of these dependencies,
        // we would need to modify the production code or use reflection for testing
        // For now, we're just using the unmocked version
        viewModel = AuthViewModel(mockContext)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `email validation works correctly`() {
        // Valid email
        viewModel.changeEmail("test@example.com")
        assertTrue(viewModel.emailValid())
        assertFalse(viewModel.emailEmpty())

        // Invalid email
        viewModel.changeEmail("invalid-email")
        assertFalse(viewModel.emailValid())
        assertFalse(viewModel.emailEmpty())

        // Empty email
        viewModel.changeEmail("")
        assertFalse(viewModel.emailValid())
        assertTrue(viewModel.emailEmpty())
    }

    @Test
    fun `password validation works correctly`() {
        // Valid password (>=6 characters)
        viewModel.changePasswordOne("password123")
        assertTrue(viewModel.passwordValid())

        // Invalid password (<6 characters)
        viewModel.changePasswordOne("pass")
        assertFalse(viewModel.passwordValid())
    }

    @Test
    fun `passwords match validation works correctly`() {
        // Matching passwords
        viewModel.changePasswordOne("password123")
        viewModel.changePasswordTwo("password123")
        assertTrue(viewModel.passwordsMatch())

        // Non-matching passwords
        viewModel.changePasswordOne("password123")
        viewModel.changePasswordTwo("differentPassword")
        assertFalse(viewModel.passwordsMatch())
    }

    @Test
    fun `signUpValid returns correct value based on input`() {
        // All fields empty
        viewModel.changeName("")
        viewModel.changeEmail("")
        viewModel.changePasswordOne("")
        viewModel.changePasswordTwo("")
        assertFalse(viewModel.signUpValid())

        // All fields filled
        viewModel.changeName("Test User")
        viewModel.changeEmail("test@example.com")
        viewModel.changePasswordOne("password123")
        viewModel.changePasswordTwo("password123")
        assertTrue(viewModel.signUpValid())

        // One field empty
        viewModel.changeName("")
        assertFalse(viewModel.signUpValid())
    }
} 
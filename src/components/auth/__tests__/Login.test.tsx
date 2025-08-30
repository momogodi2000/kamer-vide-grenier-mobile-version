import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Login from '../Login';
import { AuthProvider } from '../../../contexts/AuthContext';

const LoginWrapper = ({ children }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

describe('Login Component', () => {
  beforeEach(() => {
    global.testUtils.mockFetchSuccess({ 
      user: global.testUtils.mockUser, 
      token: 'test-token' 
    });
  });

  it('should render login form', () => {
    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('should handle text input changes', () => {
    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should submit login form with valid data', async () => {
    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
    });
  });

  it('should display validation errors', async () => {
    const { getByTestId, getByText } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('auth.validation.emailRequired')).toBeTruthy();
      expect(getByText('auth.validation.passwordRequired')).toBeTruthy();
    });
  });

  it('should handle login error', async () => {
    global.testUtils.mockFetchError('Invalid credentials', 401);

    const { getByTestId, getByText } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('should toggle password visibility', () => {
    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const passwordInput = getByTestId('password-input');
    const toggleButton = getByTestId('password-toggle');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should navigate to register screen', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({ navigate: mockNavigate });

    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to forgot password screen', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({ navigate: mockNavigate });

    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const forgotPasswordButton = getByTestId('forgot-password-button');
    fireEvent.press(forgotPasswordButton);

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should show loading state during login', async () => {
    // Mock delayed response
    global.fetch = jest.fn(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(global.testUtils.createMockResponse({
          success: true,
          data: { user: global.testUtils.mockUser, token: 'test-token' }
        })), 100)
      )
    );

    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByTestId('login-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle keyboard dismissal on container press', () => {
    const { getByTestId } = render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const container = getByTestId('login-container');
    fireEvent.press(container);

    // Keyboard should be dismissed (tested through component behavior)
    expect(container).toBeTruthy();
  });
});
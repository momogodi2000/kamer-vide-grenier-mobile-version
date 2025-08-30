import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../useAuth';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    global.fetch.mockClear();
  });

  it('should initialize with null user and loading false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    global.testUtils.mockFetchSuccess({
      user: global.testUtils.mockUser,
      token: 'test-token'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(global.testUtils.mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    
    // Verify AsyncStorage calls
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(global.testUtils.mockUser));
  });

  it('should handle login error', async () => {
    global.testUtils.mockFetchError('Invalid credentials', 401);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should register successfully', async () => {
    global.testUtils.mockFetchSuccess({
      user: global.testUtils.mockUser,
      token: 'test-token'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+237677123456',
      password: 'password123'
    };

    await act(async () => {
      await result.current.register(userData);
    });

    expect(result.current.user).toEqual(global.testUtils.mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(global.testUtils.mockUser));
  });

  it('should logout successfully', async () => {
    // First login
    global.testUtils.mockFetchSuccess({
      user: global.testUtils.mockUser,
      token: 'test-token'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should update user profile', async () => {
    // First login
    global.testUtils.mockFetchSuccess({
      user: global.testUtils.mockUser,
      token: 'test-token'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Mock update response
    const updatedUser = { ...global.testUtils.mockUser, firstName: 'Updated' };
    global.testUtils.mockFetchSuccess({ user: updatedUser });

    await act(async () => {
      await result.current.updateProfile({ firstName: 'Updated' });
    });

    expect(result.current.user.firstName).toBe('Updated');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
  });

  it('should verify email', async () => {
    global.testUtils.mockFetchSuccess({ message: 'Email verified successfully' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verifyEmail('verification-token');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'verification-token' })
    });
  });

  it('should verify phone', async () => {
    global.testUtils.mockFetchSuccess({ message: 'Phone verified successfully' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.verifyPhone('+237677123456', '123456');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+237677123456', code: '123456' })
    });
  });

  it('should handle token refresh', async () => {
    // Set stored token and user
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('expired-token');
      if (key === 'user') return Promise.resolve(JSON.stringify(global.testUtils.mockUser));
      return Promise.resolve(null);
    });

    global.testUtils.mockFetchSuccess({
      user: global.testUtils.mockUser,
      token: 'new-token'
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(result.current.user).toEqual(global.testUtils.mockUser);
  });

  it('should restore user session from AsyncStorage', async () => {
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('stored-token');
      if (key === 'user') return Promise.resolve(JSON.stringify(global.testUtils.mockUser));
      return Promise.resolve(null);
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.user).toEqual(global.testUtils.mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle corrupted AsyncStorage data', async () => {
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('valid-token');
      if (key === 'user') return Promise.resolve('invalid-json');
      return Promise.resolve(null);
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password123');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle forgotten password', async () => {
    global.testUtils.mockFetchSuccess({ message: 'Reset email sent' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.forgotPassword('test@example.com');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
  });

  it('should reset password', async () => {
    global.testUtils.mockFetchSuccess({ message: 'Password reset successfully' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.resetPassword('reset-token', 'newpassword123');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'reset-token', password: 'newpassword123' })
    });
  });
});
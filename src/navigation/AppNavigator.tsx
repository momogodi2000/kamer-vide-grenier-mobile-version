import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';
import { setLoading } from '../store/slices/uiSlice';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ModalNavigator from './ModalNavigator';
import { RootStackParamList } from './types';

import LoadingScreen from '../screens/LoadingScreen';

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const initializeApp = async () => {
      dispatch(setLoading({ key: 'splash', value: true }));
      
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.warn('Auth check failed:', error);
      } finally {
        dispatch(setLoading({ key: 'splash', value: false }));
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading screen while initializing
  if (!isInitialized || loading.splash) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
        }}
      >
        {isAuthenticated ? (
          <RootStack.Screen name="MainStack" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthNavigator} />
        )}
        
        {/* Modal screens */}
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen name="ImageViewer" component={ModalNavigator.ImageViewer} />
          <RootStack.Screen name="LocationPicker" component={ModalNavigator.LocationPicker} />
          <RootStack.Screen name="PaymentMethodModal" component={ModalNavigator.PaymentMethodModal} />
          <RootStack.Screen name="ProductShare" component={ModalNavigator.ProductShare} />
          <RootStack.Screen name="OrderShare" component={ModalNavigator.OrderShare} />
          <RootStack.Screen name="ReportProduct" component={ModalNavigator.ReportProduct} />
          <RootStack.Screen name="ContactSeller" component={ModalNavigator.ContactSeller} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
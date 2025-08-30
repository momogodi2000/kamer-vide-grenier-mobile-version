import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';

// Import screens (these will be created next)
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import VerifyPhoneScreen from '../screens/auth/VerifyPhoneScreen';
import KYCDocumentScreen from '../screens/auth/KYCDocumentScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <AuthStack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ gestureEnabled: false }}
      />
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: true,
          title: 'Connexion',
        }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Créer un compte',
        }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Mot de passe oublié',
        }}
      />
      <AuthStack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          title: 'Réinitialiser le mot de passe',
        }}
      />
      <AuthStack.Screen 
        name="VerifyEmail" 
        component={VerifyEmailScreen}
        options={{
          headerShown: true,
          title: 'Vérifier l\'email',
        }}
      />
      <AuthStack.Screen 
        name="VerifyPhone" 
        component={VerifyPhoneScreen}
        options={{
          headerShown: true,
          title: 'Vérifier le téléphone',
        }}
      />
      <AuthStack.Screen 
        name="KYC" 
        component={KYCDocumentScreen}
        options={{
          headerShown: false,
        }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
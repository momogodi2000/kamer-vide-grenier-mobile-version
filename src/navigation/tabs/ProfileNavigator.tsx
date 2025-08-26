import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';

// Placeholder components
const ProfileScreen = () => <></>;
const EditProfileScreen = () => <></>;
const SettingsScreen = () => <></>;
const NotificationsScreen = () => <></>;
const WishlistScreen = () => <></>;
const ReviewsScreen = () => <></>;
const PaymentMethodsScreen = () => <></>;
const AddressesScreen = () => <></>;
const HelpCenterScreen = () => <></>;
const AboutScreen = () => <></>;
const ChangePasswordScreen = () => <></>;
const LanguageScreen = () => <></>;
const PrivacyScreen = () => <></>;
const TermsScreen = () => <></>;

const ProfileStack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="Wishlist" component={WishlistScreen} />
      <ProfileStack.Screen name="Reviews" component={ReviewsScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="Addresses" component={AddressesScreen} />
      <ProfileStack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="Language" component={LanguageScreen} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} />
      <ProfileStack.Screen name="Terms" component={TermsScreen} />
    </ProfileStack.Navigator>
  );
};

export default ProfileNavigator;
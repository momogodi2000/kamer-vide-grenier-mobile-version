import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { ProfileStackParamList } from '../types';
import { RootState } from '../../store';

// Import all dashboard screens
import AdminDashboard from '../../screens/admin/AdminDashboard';
import ClientDashboard from '../../screens/client/ClientDashboard';
import DeliveryDashboard from '../../screens/delivery/DeliveryDashboard';
import DashboardScreen from '../../screens/profile/DashboardScreen';
import WalletScreen from '../../screens/profile/WalletScreen';

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
  const { user } = useSelector((state: RootState) => state.auth);

  const getRoleDashboard = () => {
    if (!user) {
      return DashboardScreen;
    }
    
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return AdminDashboard;
      case 'client':
      case 'partner': // Partners now redirect to client dashboard
        return ClientDashboard;
      case 'delivery':
        return DeliveryDashboard;
      default:
        return DashboardScreen;
    }
  };

  const DashboardComponent = getRoleDashboard();

  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={DashboardComponent}
        options={{
          title: user?.role === 'admin' ? 'Admin Dashboard' :
                 user?.role === 'client' ? 'Mon Dashboard' :
                 user?.role === 'delivery' ? 'Livreur Dashboard' :
                 'Dashboard',
        }}
      />
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
      <ProfileStack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Portefeuille' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier Profil' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <ProfileStack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Favoris' }} />
      <ProfileStack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Avis' }} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Méthodes de paiement' }} />
      <ProfileStack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Adresses' }} />
      <ProfileStack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ title: 'Centre d\'aide' }} />
      <ProfileStack.Screen name="About" component={AboutScreen} options={{ title: 'À propos' }} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Changer mot de passe' }} />
      <ProfileStack.Screen name="Language" component={LanguageScreen} options={{ title: 'Langue' }} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Confidentialité' }} />
      <ProfileStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Conditions d\'utilisation' }} />
    </ProfileStack.Navigator>
  );
};

export default ProfileNavigator;

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Alert 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../../services/authService';

type VerifyEmailScreenRouteProp = RouteProp<{
  VerifyEmail: { token?: string; email?: string };
}, 'VerifyEmail'>;

const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resent'>('loading');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { token, email: userEmail } = route.params || {};

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
    
    if (token) {
      verifyEmail(token);
    }
  }, [token, userEmail]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await authService.verifyEmail(verificationToken);
      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigation.navigate('Login' as never, {
          message: 'Email vérifié avec succès! Vous pouvez maintenant vous connecter.'
        } as never);
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.message || 'Erreur lors de la vérification de l\'email');
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      setStatus('resent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.blueIcon]}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
            <Text style={styles.title}>Vérification en cours...</Text>
            <Text style={styles.description}>
              Nous vérifions votre adresse email. Veuillez patienter.
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.greenIcon]}>
              <Icon name="check-circle" size={40} color="#16A34A" />
            </View>
            <Text style={styles.title}>Email vérifié avec succès!</Text>
            <Text style={styles.description}>
              Votre compte a été activé. Vous allez être redirigé vers la page de connexion.
            </Text>
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                Redirection automatique dans quelques secondes...
              </Text>
            </View>
          </View>
        );

      case 'error':
        return (
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.redIcon]}>
              <Icon name="error" size={40} color="#DC2626" />
            </View>
            <Text style={styles.title}>Erreur de vérification</Text>
            <Text style={styles.description}>{error}</Text>
            <View style={styles.buttonContainer}>
              {email && (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, isResending && styles.disabledButton]}
                  onPress={resendVerification}
                  disabled={isResending}
                >
                  {isResending ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator size="small" color="white" style={styles.buttonSpinner} />
                      <Text style={styles.buttonText}>Envoi en cours...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Renvoyer l'email de vérification</Text>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'resent':
        return (
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.blueIcon]}>
              <Icon name="email" size={40} color="#2563EB" />
            </View>
            <Text style={styles.title}>Email envoyé!</Text>
            <Text style={styles.description}>
              Un nouvel email de vérification a été envoyé à votre adresse.
            </Text>
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Consultez votre boîte email et cliquez sur le lien de vérification.
                N'oubliez pas de vérifier vos spams.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Kamer Vidé-Grenier</Text>
      </View>
      
      <View style={styles.card}>
        {renderContent()}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Besoin d'aide?{' '}
          <Text style={styles.linkText}>Contactez notre support</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  blueIcon: {
    backgroundColor: '#DBEAFE',
  },
  greenIcon: {
    backgroundColor: '#DCFCE7',
  },
  redIcon: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  successText: {
    color: '#166534',
    textAlign: 'center',
    fontSize: 14,
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  infoText: {
    color: '#1E40AF',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSpinner: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default VerifyEmailScreen;
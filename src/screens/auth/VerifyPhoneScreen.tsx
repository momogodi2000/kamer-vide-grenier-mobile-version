import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../../services/authService';

type VerifyPhoneScreenRouteProp = RouteProp<{
  VerifyPhone: { phone?: string };
}, 'VerifyPhone'>;

const VerifyPhoneScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<VerifyPhoneScreenRouteProp>();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // Get phone from navigation state
    if (route.params?.phone) {
      setPhone(route.params.phone);
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [route.params]);

  const verifyPhone = async () => {
    if (code.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    setStatus('loading');
    setError('');
    
    try {
      await authService.verifyPhone(code);
      setStatus('success');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigation.navigate('Dashboard' as never);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.message || 'Code de vérification invalide');
    }
  };

  const resendCode = async () => {
    if (!phone || timeLeft > 0) return;
    
    setIsResending(true);
    try {
      // TODO: Implement resend phone verification
      Alert.alert('Fonctionnalité non disponible', 'La fonctionnalité de renvoi de code n\'est pas encore disponible');
      setTimeLeft(60);
      setError('');
      Alert.alert('Code envoyé', 'Un nouveau code de vérification a été envoyé');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhone = (phone: string) => {
    // Format Cameroonian phone number for display
    if (phone.startsWith('+237')) {
      return phone.replace('+237', '+237 ');
    }
    return phone;
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError('');
  };

  if (status === 'success') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.greenIcon]}>
              <Icon name="check-circle" size={40} color="#16A34A" />
            </View>
            <Text style={styles.title}>Téléphone vérifié!</Text>
            <Text style={styles.description}>
              Votre numéro de téléphone a été vérifié avec succès. 
              Redirection vers votre dashboard...
            </Text>
            <ActivityIndicator size="large" color="#16A34A" style={styles.loadingIndicator} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Kamer Vidé-Grenier</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={[styles.iconContainer, styles.blueIcon]}>
            <Icon name="smartphone" size={40} color="#2563EB" />
          </View>
          
          <Text style={styles.title}>Vérifiez votre téléphone</Text>
          
          <Text style={styles.description}>
            Nous avons envoyé un code à 6 chiffres au numéro:
          </Text>
          
          <Text style={styles.phoneNumber}>
            {formatPhone(phone)}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Code de vérification</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
              autoFocus
            />
            <Text style={styles.inputHelp}>
              Entrez le code à 6 chiffres reçu par SMS
            </Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Icon name="error" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button, 
              styles.primaryButton,
              (code.length !== 6 || status === 'loading') && styles.disabledButton
            ]}
            onPress={verifyPhone}
            disabled={code.length !== 6 || status === 'loading'}
          >
            {status === 'loading' ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" style={styles.buttonSpinner} />
                <Text style={styles.buttonText}>Vérification...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Vérifier</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Vous n'avez pas reçu le code?{' '}
            </Text>
            <TouchableOpacity
              onPress={resendCode}
              disabled={timeLeft > 0 || isResending}
              style={[styles.resendButton, (timeLeft > 0 || isResending) && styles.disabledButton]}
            >
              <Text style={[
                styles.resendButtonText,
                (timeLeft > 0 || isResending) && styles.disabledText
              ]}>
                {isResending 
                  ? 'Envoi en cours...'
                  : timeLeft > 0 
                    ? `Renvoyer dans ${timeLeft}s`
                    : 'Renvoyer le code'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Problème avec votre numéro?{' '}
          <Text style={styles.linkText}>Contactez le support</Text>
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
    marginBottom: 8,
    lineHeight: 24,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  inputHelp: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
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
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16A34A',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  loadingIndicator: {
    marginTop: 16,
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
    color: '#16A34A',
    fontWeight: '500',
  },
});

export default VerifyPhoneScreen;
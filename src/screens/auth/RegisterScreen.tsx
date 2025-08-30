import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthStackParamList } from '../../navigation/types';
import { RootState, AppDispatch } from '../../store';
import { register } from '../../store/slices/authSlice';
import { securityService } from '../../services';
import { CreateUserRequest, Language, Region } from '../../models';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    preferred_language: 'fr' as Language,
    city: '',
    region: undefined,
    referral_code: '',
    terms_accepted: false,
    gdpr_consent: false,
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const regions: Region[] = [
    'Centre', 'Littoral', 'Ouest', 'Sud-Ouest', 'Nord-Ouest', 
    'Adamaoua', 'Nord', 'Extreme-Nord', 'Est', 'Sud'
  ];
  
  const handleInputChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateStep1 = (): boolean => {
    if (!formData.first_name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre prénom');
      return false;
    }
    
    if (!formData.last_name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return false;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = (): boolean => {
    if (!formData.password) {
      Alert.alert('Erreur', 'Veuillez saisir un mot de passe');
      return false;
    }
    
    if (formData.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      Alert.alert(
        'Erreur', 
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      );
      return false;
    }
    
    if (formData.password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };
  
  const validateStep3 = (): boolean => {
    if (!formData.terms_accepted) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions d\'utilisation');
      return false;
    }
    
    if (!formData.gdpr_consent) {
      Alert.alert('Erreur', 'Veuillez accepter la politique de confidentialité');
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    switch (currentStep) {
      case 1:
        if (validateStep1()) {
          setCurrentStep(2);
        }
        break;
      case 2:
        if (validateStep2()) {
          setCurrentStep(3);
        }
        break;
      case 3:
        handleRegister();
        break;
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleRegister = async () => {
    if (!validateStep3()) return;
    
    try {
      const result = await dispatch(register(formData)).unwrap();
      
      if (result.success) {
        Alert.alert(
          'Succès', 
          'Compte créé avec succès! Veuillez vérifier votre email.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('VerifyEmail', { email: formData.email })
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la création du compte');
    }
  };
  
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      
      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={formData.first_name}
            onChangeText={(text) => handleInputChange('first_name', text)}
            autoCapitalize="words"
          />
        </View>
        
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={formData.last_name}
            onChangeText={(text) => handleInputChange('last_name', text)}
            autoCapitalize="words"
          />
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Adresse email"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Numéro de téléphone"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
  
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Sécurité du compte</Text>
      
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Mot de passe"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.passwordToggle}
        >
          <Icon 
            name={showPassword ? 'visibility-off' : 'visibility'} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.passwordToggle}
        >
          <Icon 
            name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Exigences du mot de passe :</Text>
        <Text style={[styles.requirement, formData.password.length >= 8 && styles.requirementMet]}>
          • Au moins 8 caractères
        </Text>
        <Text style={[styles.requirement, /(?=.*[a-z])/.test(formData.password) && styles.requirementMet]}>
          • Une lettre minuscule
        </Text>
        <Text style={[styles.requirement, /(?=.*[A-Z])/.test(formData.password) && styles.requirementMet]}>
          • Une lettre majuscule
        </Text>
        <Text style={[styles.requirement, /(?=.*\d)/.test(formData.password) && styles.requirementMet]}>
          • Un chiffre
        </Text>
      </View>
    </View>
  );
  
  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Informations complémentaires</Text>
      
      <View style={styles.inputContainer}>
        <Icon name="location-city" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Ville (optionnel)"
          value={formData.city}
          onChangeText={(text) => handleInputChange('city', text)}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Icon name="language" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Code de parrainage (optionnel)"
          value={formData.referral_code}
          onChangeText={(text) => handleInputChange('referral_code', text)}
          autoCapitalize="characters"
        />
      </View>
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('terms_accepted', !formData.terms_accepted)}
        >
          <Icon 
            name={formData.terms_accepted ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={formData.terms_accepted ? '#2E7D32' : '#666'} 
          />
          <Text style={styles.checkboxText}>
            J'accepte les{' '}
            <Text style={styles.linkText}>conditions d'utilisation</Text>
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('gdpr_consent', !formData.gdpr_consent)}
        >
          <Icon 
            name={formData.gdpr_consent ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={formData.gdpr_consent ? '#2E7D32' : '#666'} 
          />
          <Text style={styles.checkboxText}>
            J'accepte la{' '}
            <Text style={styles.linkText}>politique de confidentialité</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Étape {currentStep} sur 3</Text>
        </View>
        
        {/* Form Section */}
        <View style={styles.formSection}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={styles.prevButton}
                onPress={handlePrevStep}
              >
                <Text style={styles.prevButtonText}>Précédent</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.nextButton, isLoading && styles.buttonDisabled]}
              onPress={handleNextStep}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentStep === 3 ? 'Créer le compte' : 'Suivant'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  halfWidth: {
    width: '48%',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  passwordRequirements: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#2E7D32',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  prevButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  prevButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;

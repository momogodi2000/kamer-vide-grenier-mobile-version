import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { RootState, AppDispatch } from '../../store';
import { submitKycDocuments, getKycStatus } from '../../store/slices/authSlice';
import { Button, Card, TextInput } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface DocumentData {
  type: 'id_card' | 'passport' | 'driving_license';
  frontImage: string | null;
  backImage: string | null;
}

const KYCScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user, kycStatus, isLoading } = useSelector((state: RootState) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    dateOfBirth: '',
    nationality: 'Camerounaise',
    address: '',
    city: '',
    region: '',
    phone: user?.phone || '',
  });

  const [documents, setDocuments] = useState<DocumentData>({
    type: 'id_card',
    frontImage: null,
    backImage: null,
  });

  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      dispatch(getKycStatus());
    }
  }, [dispatch, user]);

  const steps = [
    { id: 1, title: 'Informations personnelles', completed: false },
    { id: 2, title: 'Document d\'identité', completed: false },
    { id: 3, title: 'Photo de profil', completed: false },
    { id: 4, title: 'Vérification', completed: false },
  ];

  const selectImage = (source: 'camera' | 'gallery', type: 'front' | 'back' | 'selfie') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      includeBase64: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    const launchFunction = source === 'camera' ? launchCamera : launchImageLibrary;

    launchFunction(options, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Erreur', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;

        if (type === 'selfie') {
          setSelfieImage(imageUri || null);
        } else if (type === 'front') {
          setDocuments(prev => ({ ...prev, frontImage: imageUri || null }));
        } else if (type === 'back') {
          setDocuments(prev => ({ ...prev, backImage: imageUri || null }));
        }
      }
    });
  };

  const handleImageSelection = (type: 'front' | 'back' | 'selfie') => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez la source de l\'image',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appareil photo', onPress: () => selectImage('camera', type) },
        { text: 'Galerie', onPress: () => selectImage('gallery', type) },
      ]
    );
  };

  const validatePersonalInfo = () => {
    const { firstName, lastName, dateOfBirth, address, city, region } = personalInfo;

    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !address.trim() || !city.trim() || !region) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }

    return true;
  };

  const validateDocuments = () => {
    if (!documents.frontImage) {
      Alert.alert('Erreur', 'Veuillez prendre une photo du recto de votre document');
      return false;
    }

    if (documents.type !== 'passport' && !documents.backImage) {
      Alert.alert('Erreur', 'Veuillez prendre une photo du verso de votre document');
      return false;
    }

    return true;
  };

  const validateSelfie = () => {
    if (!selfieImage) {
      Alert.alert('Erreur', 'Veuillez prendre une photo de vous');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validatePersonalInfo()) return;
    if (currentStep === 2 && !validateDocuments()) return;
    if (currentStep === 3 && !validateSelfie()) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const kycData = {
        personalInfo,
        documents: {
          ...documents,
          frontImage: documents.frontImage,
          backImage: documents.backImage,
        },
        selfieImage,
      };

      await dispatch(submitKycDocuments(kycData)).unwrap();

      Alert.alert(
        'Succès',
        'Votre demande de vérification KYC a été soumise avec succès. Nous vous contacterons dans les 24-48 heures.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la soumission KYC');
    }
  };

  const renderPersonalInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepDescription}>
        Veuillez fournir vos informations personnelles pour la vérification d'identité.
      </Text>

      <Card style={styles.formCard}>
        <TextInput
          label="Prénom *"
          value={personalInfo.firstName}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, firstName: value }))}
          placeholder="Votre prénom"
        />

        <TextInput
          label="Nom *"
          value={personalInfo.lastName}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, lastName: value }))}
          placeholder="Votre nom de famille"
        />

        <TextInput
          label="Date de naissance *"
          value={personalInfo.dateOfBirth}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: value }))}
          placeholder="JJ/MM/AAAA"
        />

        <TextInput
          label="Nationalité"
          value={personalInfo.nationality}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, nationality: value }))}
          placeholder="Votre nationalité"
        />

        <TextInput
          label="Adresse *"
          value={personalInfo.address}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, address: value }))}
          placeholder="Votre adresse complète"
          multiline
          numberOfLines={2}
        />

        <TextInput
          label="Ville *"
          value={personalInfo.city}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, city: value }))}
          placeholder="Votre ville"
        />

        <TextInput
          label="Région *"
          value={personalInfo.region}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, region: value }))}
          placeholder="Votre région"
        />

        <TextInput
          label="Téléphone"
          value={personalInfo.phone}
          onChangeText={(value) => setPersonalInfo(prev => ({ ...prev, phone: value }))}
          placeholder="Votre numéro de téléphone"
          keyboardType="phone-pad"
        />
      </Card>
    </ScrollView>
  );

  const renderDocumentStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepDescription}>
        Veuillez fournir une photo claire de votre document d'identité.
      </Text>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Type de document</Text>

        <View style={styles.documentTypeContainer}>
          {[
            { value: 'id_card', label: 'Carte d\'identité', icon: 'credit-card' },
            { value: 'passport', label: 'Passeport', icon: 'flight' },
            { value: 'driving_license', label: 'Permis de conduire', icon: 'drive-eta' },
          ].map((docType) => (
            <TouchableOpacity
              key={docType.value}
              style={[
                styles.documentTypeOption,
                documents.type === docType.value && styles.documentTypeSelected,
              ]}
              onPress={() => setDocuments(prev => ({ ...prev, type: docType.value as any }))}
            >
              <Icon
                name={docType.icon}
                size={24}
                color={documents.type === docType.value ? colors.primary : colors.text.secondary}
              />
              <Text
                style={[
                  styles.documentTypeLabel,
                  documents.type === docType.value && styles.documentTypeLabelSelected,
                ]}
              >
                {docType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.documentUploadContainer}>
          <Text style={styles.sectionTitle}>Photos du document</Text>

          <View style={styles.imageUploadRow}>
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={() => handleImageSelection('front')}
            >
              {documents.frontImage ? (
                <Image source={{ uri: documents.frontImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="add-a-photo" size={40} color={colors.text.secondary} />
                  <Text style={styles.imagePlaceholderText}>Recto</Text>
                </View>
              )}
            </TouchableOpacity>

            {documents.type !== 'passport' && (
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={() => handleImageSelection('back')}
              >
                {documents.backImage ? (
                  <Image source={{ uri: documents.backImage }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="add-a-photo" size={40} color={colors.text.secondary} />
                    <Text style={styles.imagePlaceholderText}>Verso</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderSelfieStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepDescription}>
        Prenez une photo de vous pour vérifier votre identité.
      </Text>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Photo de profil</Text>

        <TouchableOpacity
          style={styles.selfieUploadButton}
          onPress={() => handleImageSelection('selfie')}
        >
          {selfieImage ? (
            <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Icon name="face" size={60} color={colors.text.secondary} />
              <Text style={styles.selfiePlaceholderText}>
                Appuyez pour prendre une photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.selfieInstructions}>
          • Assurez-vous que votre visage est bien visible{'\n'}
          • Évitez les lunettes de soleil{'\n'}
          • Utilisez un éclairage naturel{'\n'}
          • Gardez une expression neutre
        </Text>
      </Card>
    </ScrollView>
  );

  const renderVerificationStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepDescription}>
        Vérifiez vos informations avant de soumettre votre demande KYC.
      </Text>

      <Card style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Informations personnelles</Text>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Nom complet:</Text>
          <Text style={styles.verificationValue}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
        </View>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Date de naissance:</Text>
          <Text style={styles.verificationValue}>{personalInfo.dateOfBirth}</Text>
        </View>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Adresse:</Text>
          <Text style={styles.verificationValue}>
            {personalInfo.address}, {personalInfo.city}, {personalInfo.region}
          </Text>
        </View>
      </Card>

      <Card style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Document d'identité</Text>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Type:</Text>
          <Text style={styles.verificationValue}>
            {documents.type === 'id_card' ? 'Carte d\'identité' :
             documents.type === 'passport' ? 'Passeport' : 'Permis de conduire'}
          </Text>
        </View>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Photos:</Text>
          <Text style={styles.verificationValue}>
            {documents.frontImage ? '✅ Recto' : '❌ Recto'} • {documents.backImage || documents.type === 'passport' ? '✅ Verso' : '❌ Verso'}
          </Text>
        </View>
      </Card>

      <Card style={styles.verificationCard}>
        <Text style={styles.verificationTitle}>Photo de profil</Text>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationLabel}>Statut:</Text>
          <Text style={styles.verificationValue}>
            {selfieImage ? '✅ Photo prise' : '❌ Photo manquante'}
          </Text>
        </View>
      </Card>

      <Card style={styles.termsCard}>
        <Text style={styles.termsTitle}>Conditions générales</Text>
        <Text style={styles.termsText}>
          En soumettant cette demande, vous acceptez que vos informations soient vérifiées
          par nos services. Le processus peut prendre 24-48 heures. Vous serez notifié par
          email et SMS une fois la vérification terminée.
        </Text>
      </Card>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderDocumentStep();
      case 3:
        return renderSelfieStep();
      case 4:
        return renderVerificationStep();
      default:
        return null;
    }
  };

  if (kycStatus === 'approved') {
    return (
      <View style={styles.approvedContainer}>
        <Icon name="verified" size={80} color={colors.success} />
        <Text style={styles.approvedTitle}>Compte vérifié</Text>
        <Text style={styles.approvedText}>
          Votre compte a été vérifié avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités.
        </Text>
        <Button
          title="Continuer"
          onPress={() => navigation.goBack()}
          style={styles.approvedButton}
        />
      </View>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <View style={styles.pendingContainer}>
        <Icon name="schedule" size={80} color={colors.warning} />
        <Text style={styles.pendingTitle}>Vérification en cours</Text>
        <Text style={styles.pendingText}>
          Votre demande de vérification est en cours de traitement. Nous vous contacterons dans les 24-48 heures.
        </Text>
        <Button
          title="Retour"
          onPress={() => navigation.goBack()}
          style={styles.pendingButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification KYC</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        {steps.map((step) => (
          <View key={step.id} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                step.id <= currentStep && styles.progressCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.progressNumber,
                  step.id <= currentStep && styles.progressNumberActive,
                ]}
              >
                {step.id}
              </Text>
            </View>
            <Text
              style={[
                styles.progressLabel,
                step.id <= currentStep && styles.progressLabelActive,
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title="Précédent"
            onPress={handlePrevious}
            variant="outline"
            style={styles.footerButton}
          />
        )}
        <Button
          title={currentStep === 4 ? 'Soumettre' : 'Suivant'}
          onPress={handleNext}
          loading={isLoading}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  progressCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  progressNumber: {
    ...typography.body1,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressNumberActive: {
    color: colors.text.white,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  stepDescription: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  formCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  documentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  documentTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  documentTypeSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  documentTypeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  documentTypeLabelSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  documentUploadContainer: {
    marginTop: spacing.lg,
  },
  imageUploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  imageUploadButton: {
    flex: 1,
    height: 120,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  selfieUploadButton: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  selfiePlaceholder: {
    alignItems: 'center',
  },
  selfiePlaceholderText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  selfieImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  selfieInstructions: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  verificationCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  verificationTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  verificationLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  verificationValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  termsCard: {
    padding: spacing.lg,
    backgroundColor: colors.warning + '10',
    borderColor: colors.warning,
    borderWidth: 1,
  },
  termsTitle: {
    ...typography.h3,
    color: colors.warning,
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  approvedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.xl,
  },
  approvedTitle: {
    ...typography.h1,
    color: colors.success,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  approvedText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  approvedButton: {
    width: '100%',
  },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.xl,
  },
  pendingTitle: {
    ...typography.h1,
    color: colors.warning,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  pendingText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  pendingButton: {
    width: '100%',
  },
});

export default KYCScreen;

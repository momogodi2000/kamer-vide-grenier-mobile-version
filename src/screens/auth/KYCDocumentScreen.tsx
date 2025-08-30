import React, { useState } from 'react';
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
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { submitKycDocuments } from '../../store/slices/authSlice';
import { Button, Card, TextInput } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface KycDocument {
  type: 'national_id' | 'passport' | 'driver_license';
  frontImage?: string;
  backImage?: string;
}

const KYCDocumentScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [currentStep, setCurrentStep] = useState<'type' | 'documents' | 'review'>('type');
  const [documentType, setDocumentType] = useState<KycDocument['type']>('national_id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documents, setDocuments] = useState<KycDocument>({
    type: 'national_id',
  });

  const documentTypes = [
    { value: 'national_id', label: 'Carte Nationale d\'Identité', icon: 'credit-card' },
    { value: 'passport', label: 'Passeport', icon: 'flight' },
    { value: 'driver_license', label: 'Permis de Conduire', icon: 'drive-eta' },
  ];

  const handleDocumentTypeSelect = (type: KycDocument['type']) => {
    setDocumentType(type);
    setDocuments({ type });
    setCurrentStep('documents');
  };

  const handleImagePick = async (side: 'front' | 'back') => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez la source de l\'image',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Galerie',
          onPress: () => pickImage(side, 'photo'),
        },
        {
          text: 'Appareil photo',
          onPress: () => pickImage(side, 'camera'),
        },
      ]
    );
  };

  const pickImage = async (side: 'front' | 'back', source: 'photo' | 'camera') => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as any,
    };

    try {
      const response: ImagePickerResponse = source === 'photo'
        ? await launchImageLibrary(options)
        : await launchCamera(options);

      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Erreur', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;

        setDocuments(prev => ({
          ...prev,
          [side === 'front' ? 'frontImage' : 'backImage']: imageUri,
        }));

        // In a real app, you'd upload the image to your server
        console.log(`Document ${side} captured:`, imageUri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de capturer l\'image');
    }
  };

  const handleSubmitKyc = async () => {
    if (!documents.frontImage || !documents.backImage || !documentNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez fournir tous les documents requis');
      return;
    }

    try {
      const kycData = {
        document_type: documentType,
        document_number: documentNumber,
        document_front: documents.frontImage,
        document_back: documents.backImage,
      };

      await dispatch(submitKycDocuments(kycData)).unwrap();
      Alert.alert(
        'Succès',
        'Vos documents KYC ont été soumis avec succès. Nous les examinerons dans les 24-48 heures.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la soumission des documents KYC');
    }
  };

  const renderDocumentTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choisir le type de document</Text>
      <Text style={styles.stepDescription}>
        Sélectionnez le document d'identification que vous souhaitez utiliser pour la vérification KYC.
      </Text>

      {documentTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={styles.documentTypeCard}
          onPress={() => handleDocumentTypeSelect(type.value as KycDocument['type'])}
        >
          <Icon name={type.icon} size={24} color={colors.primary} />
          <Text style={styles.documentTypeLabel}>{type.label}</Text>
          <Icon name="chevron-right" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDocumentUpload = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Télécharger les documents</Text>
      <Text style={styles.stepDescription}>
        Prenez des photos claires et lisibles des deux côtés de votre {documentTypes.find(t => t.value === documentType)?.label.toLowerCase()}.
      </Text>

      <TextInput
        label="Numéro du document"
        value={documentNumber}
        onChangeText={setDocumentNumber}
        placeholder="Entrez le numéro du document"
        style={styles.input}
      />

      <View style={styles.documentUploadContainer}>
        <Card style={styles.documentCard}>
          <Text style={styles.documentLabel}>Recto (devant)</Text>
          {documents.frontImage ? (
            <Image source={{ uri: documents.frontImage }} style={styles.documentImage} />
          ) : (
            <View style={styles.documentPlaceholder}>
              <Icon name="add-a-photo" size={48} color={colors.text.secondary} />
              <Text style={styles.placeholderText}>Ajouter une photo</Text>
            </View>
          )}
          <Button
            title={documents.frontImage ? "Changer la photo" : "Ajouter une photo"}
            onPress={() => handleImagePick('front')}
            variant="outline"
            style={styles.uploadButton}
          />
        </Card>

        <Card style={styles.documentCard}>
          <Text style={styles.documentLabel}>Verso (arrière)</Text>
          {documents.backImage ? (
            <Image source={{ uri: documents.backImage }} style={styles.documentImage} />
          ) : (
            <View style={styles.documentPlaceholder}>
              <Icon name="add-a-photo" size={48} color={colors.text.secondary} />
              <Text style={styles.placeholderText}>Ajouter une photo</Text>
            </View>
          )}
          <Button
            title={documents.backImage ? "Changer la photo" : "Ajouter une photo"}
            onPress={() => handleImagePick('back')}
            variant="outline"
            style={styles.uploadButton}
          />
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Précédent"
          onPress={() => setCurrentStep('type')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Soumettre"
          onPress={handleSubmitKyc}
          loading={isLoading}
          disabled={!documents.frontImage || !documents.backImage || !documentNumber.trim()}
          style={styles.submitButton}
        />
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Révision des documents</Text>
      <Text style={styles.stepDescription}>
        Vérifiez vos informations avant de soumettre.
      </Text>

      <Card style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Type de document:</Text>
        <Text style={styles.reviewValue}>
          {documentTypes.find(t => t.value === documentType)?.label}
        </Text>

        <Text style={styles.reviewLabel}>Numéro du document:</Text>
        <Text style={styles.reviewValue}>{documentNumber}</Text>

        <Text style={styles.reviewLabel}>Statut KYC actuel:</Text>
        <Text style={[styles.reviewValue, styles.statusText]}>
          En cours de traitement
        </Text>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Modifier"
          onPress={() => setCurrentStep('documents')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Confirmer et soumettre"
          onPress={handleSubmitKyc}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification KYC</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, currentStep === 'type' && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep === 'type' && styles.progressTextActive]}>1</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={[styles.progressStep, (currentStep === 'documents' || currentStep === 'review') && styles.progressStepActive]}>
          <Text style={[styles.progressText, (currentStep === 'documents' || currentStep === 'review') && styles.progressTextActive]}>2</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={[styles.progressStep, currentStep === 'review' && styles.progressStepActive]}>
          <Text style={[styles.progressText, currentStep === 'review' && styles.progressTextActive]}>3</Text>
        </View>
      </View>

      {currentStep === 'type' && renderDocumentTypeSelection()}
      {currentStep === 'documents' && renderDocumentUpload()}
      {currentStep === 'review' && renderReview()}
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: colors.text.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepDescription: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  documentTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentTypeLabel: {
    ...typography.body1,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.md,
  },
  input: {
    marginBottom: spacing.lg,
  },
  documentUploadContainer: {
    gap: spacing.lg,
  },
  documentCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  documentLabel: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  documentPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  placeholderText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  uploadButton: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  submitButton: {
    flex: 1,
  },
  reviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  reviewLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  reviewValue: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statusText: {
    textTransform: 'capitalize',
  },
});

export default KYCDocumentScreen;

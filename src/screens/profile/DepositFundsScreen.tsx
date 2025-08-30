import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { walletService } from '../../services/walletService';

const DepositFundsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'mtn_mobile_money',
      name: 'MTN Mobile Money',
      icon: 'phone-android',
      description: 'Paiement via MTN Mobile Money',
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: 'phone-android',
      description: 'Paiement via Orange Money',
    },
    {
      id: 'stripe',
      name: 'Carte bancaire',
      icon: 'credit-card',
      description: 'Paiement par carte Visa/Mastercard',
    },
    {
      id: 'campay',
      name: 'Campay',
      icon: 'account-balance-wallet',
      description: 'Paiement via Campay',
    },
  ];

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 1000) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 1000 XAF');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Méthode requise', 'Veuillez sélectionner une méthode de paiement');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await walletService.addFunds(
        parseFloat(amount),
        selectedMethod,
        'Dépôt de fonds via mobile'
      );

      if (response.success) {
        Alert.alert(
          'Succès',
          'Votre demande de dépôt a été initiée. Vous recevrez une confirmation sous peu.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de traiter le dépôt');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du traitement');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  const renderPaymentMethod = (method: typeof paymentMethods[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.methodCard,
        selectedMethod === method.id && styles.selectedMethodCard,
      ]}
      onPress={() => setSelectedMethod(method.id)}
    >
      <View style={styles.methodHeader}>
        <View style={styles.methodIcon}>
          <Icon
            name={method.icon}
            size={24}
            color={selectedMethod === method.id ? colors.primary : colors.text.secondary}
          />
        </View>
        <View style={styles.methodInfo}>
          <Text
            style={[
              styles.methodName,
              selectedMethod === method.id && styles.selectedMethodText,
            ]}
          >
            {method.name}
          </Text>
          <Text style={styles.methodDescription}>
            {method.description}
          </Text>
        </View>
        {selectedMethod === method.id && (
          <Icon name="check-circle" size={24} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Déposer des fonds</Text>
      </View>

      {/* Amount Input */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Montant à déposer</Text>
        <View style={styles.amountInputContainer}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(value) => setAmount(formatAmount(value))}
            placeholder="0"
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.currencyText}>XAF</Text>
        </View>
        <Text style={styles.minimumText}>Montant minimum: 1000 XAF</Text>
      </Card>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisir une méthode de paiement</Text>
        {paymentMethods.map(renderPaymentMethod)}
      </View>

      {/* Deposit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.depositButton,
            (!amount || !selectedMethod || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleDeposit}
          disabled={!amount || !selectedMethod || isProcessing}
        >
          <Text style={styles.depositButtonText}>
            {isProcessing ? 'Traitement...' : 'Déposer les fonds'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Icon name="info" size={20} color={colors.info} />
          <Text style={styles.infoTitle}>Informations importantes</Text>
        </View>
        <Text style={styles.infoText}>
          • Les fonds déposés seront disponibles dans votre portefeuille après confirmation{'\n'}
          • Les frais de transaction varient selon la méthode choisie{'\n'}
          • En cas de problème, contactez notre support
        </Text>
      </Card>
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
    padding: spacing.lg,
    backgroundColor: colors.background.white,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  amountCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  amountLabel: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.h2,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  currencyText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  minimumText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  methodCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedMethodCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  selectedMethodText: {
    color: colors.primary,
  },
  methodDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  depositButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
  depositButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: 'bold',
  },
  infoCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...typography.body1,
    color: colors.info,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  infoText: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default DepositFundsScreen;

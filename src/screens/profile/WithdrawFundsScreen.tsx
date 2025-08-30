import React, { useState, useEffect } from 'react';
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
import { CreateWithdrawalRequest } from '../../types/api';

const WithdrawFundsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const response = await walletService.getWalletBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const withdrawalMethods = [
    {
      id: 'mtn_mobile_money',
      name: 'MTN Mobile Money',
      icon: 'phone-android',
      provider: 'MTN',
      description: 'Retrait vers MTN Mobile Money',
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: 'phone-android',
      provider: 'Orange',
      description: 'Retrait vers Orange Money',
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: 'account-balance',
      provider: 'Bank',
      description: 'Retrait vers compte bancaire',
    },
  ];

  const handleWithdraw = async () => {
    const withdrawalAmount = parseFloat(amount);

    if (!amount || withdrawalAmount < 1000) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 1000 XAF');
      return;
    }

    if (withdrawalAmount > walletBalance) {
      Alert.alert('Solde insuffisant', 'Le montant demandé dépasse votre solde disponible');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Méthode requise', 'Veuillez sélectionner une méthode de retrait');
      return;
    }

    if (!accountNumber) {
      Alert.alert('Numéro de compte requis', 'Veuillez saisir le numéro de compte');
      return;
    }

    if (!accountName) {
      Alert.alert('Nom du titulaire requis', 'Veuillez saisir le nom du titulaire du compte');
      return;
    }

    setIsProcessing(true);
    try {
      const withdrawalData: CreateWithdrawalRequest = {
        amount: withdrawalAmount,
        method: selectedMethod === 'bank_transfer' ? 'bank_transfer' : 'mobile_money',
        provider: selectedMethod === 'mtn_mobile_money' ? 'mtn' :
                 selectedMethod === 'orange_money' ? 'orange' : 'stripe',
        account_number: accountNumber,
        account_name: accountName,
        description: 'Retrait de fonds demandé via mobile',
      };

      const response = await walletService.requestWithdrawal(withdrawalData);

      if (response.success) {
        Alert.alert(
          'Demande envoyée',
          'Votre demande de retrait a été soumise. Elle sera traitée dans les 24-48 heures.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de traiter le retrait');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du traitement');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  const getMaxWithdrawalAmount = () => {
    return Math.min(walletBalance, 500000); // Max 500,000 XAF per withdrawal
  };

  const renderWithdrawalMethod = (method: typeof withdrawalMethods[0]) => (
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
        <Text style={styles.title}>Retirer des fonds</Text>
      </View>

      {/* Balance Info */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={styles.balanceAmount}>
          {walletBalance.toLocaleString('fr-FR')} XAF
        </Text>
        <Text style={styles.maxWithdrawalText}>
          Retrait maximum: {getMaxWithdrawalAmount().toLocaleString('fr-FR')} XAF
        </Text>
      </Card>

      {/* Amount Input */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Montant à retirer</Text>
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

      {/* Withdrawal Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisir une méthode de retrait</Text>
        {withdrawalMethods.map(renderWithdrawalMethod)}
      </View>

      {/* Account Details */}
      {selectedMethod && (
        <Card style={styles.accountCard}>
          <Text style={styles.sectionTitle}>Détails du compte</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {selectedMethod === 'bank_transfer' ? 'Numéro de compte bancaire' : 'Numéro de téléphone'}
            </Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={selectedMethod === 'bank_transfer' ? '1234567890' : '+237 677 123 456'}
              keyboardType={selectedMethod === 'bank_transfer' ? 'numeric' : 'phone-pad'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {selectedMethod === 'bank_transfer' ? 'Nom du titulaire du compte' : 'Nom complet'}
            </Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Jean Dupont"
              autoCapitalize="words"
            />
          </View>
        </Card>
      )}

      {/* Withdraw Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!amount || !selectedMethod || !accountNumber || !accountName || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleWithdraw}
          disabled={!amount || !selectedMethod || !accountNumber || !accountName || isProcessing}
        >
          <Text style={styles.withdrawButtonText}>
            {isProcessing ? 'Traitement...' : 'Demander le retrait'}
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
          • Les retraits sont traités dans les 24-48 heures{'\n'}
          • Des frais de traitement peuvent s\'appliquer{'\n'}
          • Le montant maximum par retrait est de 500 000 XAF{'\n'}
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
  balanceCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
  },
  balanceLabel: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  maxWithdrawalText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  amountCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  accountCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
  },
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  withdrawButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
  withdrawButtonText: {
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

export default WithdrawFundsScreen;

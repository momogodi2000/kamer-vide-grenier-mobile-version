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

const TransferFundsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);

    if (!amount || transferAmount < 500) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 500 XAF');
      return;
    }

    if (!recipientId) {
      Alert.alert('Destinataire requis', 'Veuillez saisir l\'ID du destinataire');
      return;
    }

    if (!recipientName) {
      Alert.alert('Nom du destinataire requis', 'Veuillez saisir le nom du destinataire');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await walletService.transferFunds(
        recipientId,
        transferAmount,
        description || 'Transfert de fonds'
      );

      if (response.success) {
        Alert.alert(
          'Transfert réussi',
          `Vous avez transféré ${transferAmount.toLocaleString('fr-FR')} XAF à ${recipientName}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Impossible de traiter le transfert');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du transfert');
    } finally {
      setIsProcessing(false);
    }
  };

  const searchRecipient = async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      return;
    }

    setIsSearchingRecipient(true);
    try {
      // This would typically call a user search API
      // For now, we'll simulate a search
      setTimeout(() => {
        if (searchTerm.includes('@')) {
          setRecipientName('Utilisateur trouvé');
          setRecipientId(searchTerm);
        } else {
          setRecipientName('');
          setRecipientId('');
        }
        setIsSearchingRecipient(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
      setIsSearchingRecipient(false);
    }
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transférer des fonds</Text>
      </View>

      {/* Recipient Search */}
      <Card style={styles.recipientCard}>
        <Text style={styles.sectionTitle}>Destinataire</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ID ou email du destinataire</Text>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={recipientId}
              onChangeText={(value) => {
                setRecipientId(value);
                searchRecipient(value);
              }}
              placeholder="user@example.com ou ID utilisateur"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {isSearchingRecipient && (
              <Icon name="search" size={20} color={colors.text.secondary} />
            )}
          </View>
        </View>

        {recipientName ? (
          <View style={styles.recipientInfo}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={styles.recipientName}>{recipientName}</Text>
          </View>
        ) : recipientId.length >= 3 ? (
          <View style={styles.recipientInfo}>
            <Icon name="error" size={20} color={colors.error} />
            <Text style={styles.recipientNotFound}>Destinataire non trouvé</Text>
          </View>
        ) : null}
      </Card>

      {/* Amount Input */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Montant à transférer</Text>
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
        <Text style={styles.minimumText}>Montant minimum: 500 XAF</Text>
      </Card>

      {/* Description */}
      <Card style={styles.descriptionCard}>
        <Text style={styles.inputLabel}>Description (optionnel)</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Motif du transfert"
          multiline
          numberOfLines={3}
          maxLength={200}
        />
      </Card>

      {/* Transfer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.transferButton,
            (!amount || !recipientId || !recipientName || isProcessing) && styles.disabledButton,
          ]}
          onPress={handleTransfer}
          disabled={!amount || !recipientId || !recipientName || isProcessing}
        >
          <Text style={styles.transferButtonText}>
            {isProcessing ? 'Traitement...' : 'Transférer les fonds'}
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
          • Les transferts sont instantanés{'\n'}
          • Vérifiez bien les informations du destinataire{'\n'}
          • Les transferts sont irréversibles{'\n'}
          • Des frais peuvent s'appliquer selon le montant
        </Text>
      </Card>

      {/* Recent Transfers */}
      <Card style={styles.recentCard}>
        <Text style={styles.sectionTitle}>Transferts récents</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('TransferHistory' as never)}
        >
          <Text style={styles.viewAllText}>Voir l'historique complet</Text>
          <Icon name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
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
  recipientCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  recipientName: {
    ...typography.body1,
    color: colors.success,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  recipientNotFound: {
    ...typography.body1,
    color: colors.error,
    marginLeft: spacing.sm,
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
  descriptionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  transferButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
  transferButtonText: {
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
  recentCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default TransferFundsScreen;

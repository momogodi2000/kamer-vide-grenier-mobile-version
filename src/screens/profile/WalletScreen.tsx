import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { walletService, Wallet, Withdrawal } from '../../services/walletService';

const WalletScreen: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const walletData = await walletService.getWallet();
      setWallet(walletData);
      const withdrawalList = await walletService.getWithdrawals();
      setWithdrawals(withdrawalList);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données du portefeuille.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!wallet) return;
    // For demo, request 1000 XAF. In real UI, prompt for amount.
    try {
      const withdrawal = await walletService.requestWithdrawal(1000);
      Alert.alert('Succès', 'Demande de retrait envoyée.');
      setWithdrawals([withdrawal, ...withdrawals]);
      loadWalletData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de demander un retrait.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Portefeuille</Text>
      {wallet && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Solde actuel :</Text>
          <Text style={styles.balanceValue}>{wallet.balance.toLocaleString()} {wallet.currency}</Text>
        </View>
      )}
      <Button title="Demander un retrait" onPress={handleRequestWithdrawal} disabled={loading || !wallet} />
      <Text style={styles.sectionTitle}>Historique des retraits</Text>
      <FlatList
        data={withdrawals}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.withdrawalItem}>
            <Text>Montant: {item.amount} {wallet?.currency}</Text>
            <Text>Statut: {item.status}</Text>
            <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun retrait trouvé.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  balanceContainer: { marginBottom: 16 },
  balanceLabel: { fontSize: 16, color: '#666' },
  balanceValue: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  withdrawalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 24 },
});

export default WalletScreen;

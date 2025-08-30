import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WalletScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portefeuille</Text>
      <Text style={styles.subtitle}>Votre portefeuille électronique</Text>
      {/* TODO: Implement wallet functionality */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

export default WalletScreen;

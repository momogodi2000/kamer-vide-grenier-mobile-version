import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      icon: 'shopping-bag',
      title: 'Acheter & Vendre',
      description: 'Découvrez des milliers de produits ou vendez les vôtres facilement',
      color: '#2563EB',
      backgroundColor: '#EFF6FF'
    },
    {
      icon: 'local-shipping',
      title: 'Livraison rapide',
      description: 'Livraison à domicile partout au Cameroun avec suivi en temps réel',
      color: '#16A34A',
      backgroundColor: '#F0FDF4'
    },
    {
      icon: 'attach-money',
      title: 'Paiements sécurisés',
      description: 'Mobile Money, Campay, Noupia - tous vos moyens de paiement favoris',
      color: '#CA8A04',
      backgroundColor: '#FEFCE8'
    },
    {
      icon: 'shield',
      title: 'Transactions sécurisées',
      description: 'Protection acheteur et vendeur avec notre système de portefeuille',
      color: '#7C3AED',
      backgroundColor: '#F5F3FF'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Utilisateurs actifs', color: '#16A34A' },
    { value: '50,000+', label: 'Produits en vente', color: '#2563EB' },
    { value: '10', label: 'Villes couvertes', color: '#7C3AED' }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#F0FDF4', '#EFF6FF', '#F5F3FF']}
        style={styles.gradientContainer}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#16A34A', '#2563EB']}
                style={styles.logoGradient}
              >
                <Icon name="shopping-bag" size={64} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>
              Bienvenue sur {'\n'}
              <Text style={styles.brandName}>Kamer Vidé-Grenier</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              La première plateforme de vide-grenier numérique du Cameroun. 
              Achetez, vendez et découvrez des trésors près de chez vous.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.backgroundColor }]}>
                  <Icon name={feature.icon} size={24} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Register' as never)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#16A34A', '#2563EB']}
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>
                  Commencer maintenant
                </Text>
                <Icon name="chevron-right" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* App Download */}
          <View style={styles.downloadSection}>
            <Text style={styles.downloadText}>
              Disponible sur iOS et Android - Téléchargez l'app mobile
            </Text>
            <View style={styles.downloadButtons}>
              <TouchableOpacity style={styles.storeButton}>
                <Text style={styles.storeButtonText}>App Store</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.storeButton}>
                <Text style={styles.storeButtonText}>Google Play</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    minHeight: height,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 40,
  },
  brandName: {
    color: '#16A34A',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  downloadSection: {
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  downloadButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  storeButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  storeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
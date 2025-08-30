import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../ui/AnimatedCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useAccessibilityContext } from '../../hooks/useAccessibility';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    growthRate: number;
    conversionRate: number;
  };
  salesChart: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  ordersChart: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  categoryChart: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'sale' | 'order' | 'customer';
    title: string;
    subtitle: string;
    amount?: number;
    timestamp: string;
  }>;
}

interface MobileAnalyticsProps {
  userRole: 'admin' | 'partner';
  timeRange: '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
}

const MobileAnalytics: React.FC<MobileAnalyticsProps> = ({
  userRole,
  timeRange,
  onTimeRangeChange,
}) => {
  const { t } = useTranslation(['analytics', 'common']);
  const { prefersReducedMotion } = useAccessibilityContext();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'sales' | 'orders' | 'categories'>('sales');

  // Mock data - replace with actual API calls
  const mockData: AnalyticsData = {
    overview: {
      totalSales: 2450000, // FCFA
      totalOrders: 156,
      totalCustomers: 89,
      averageOrderValue: 15705,
      growthRate: 12.5,
      conversionRate: 3.8,
    },
    salesChart: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [320000, 450000, 380000, 520000, 490000, 680000, 550000],
      }],
    },
    ordersChart: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [18, 25, 22, 32, 28, 38, 31],
      }],
    },
    categoryChart: [
      {
        name: 'Électronique',
        population: 35,
        color: '#3B82F6',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Mode',
        population: 28,
        color: '#10B981',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Maison',
        population: 18,
        color: '#F59E0B',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Sport',
        population: 12,
        color: '#EF4444',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
      {
        name: 'Autres',
        population: 7,
        color: '#8B5CF6',
        legendFontColor: '#374151',
        legendFontSize: 12,
      },
    ],
    recentActivities: [
      {
        id: '1',
        type: 'sale',
        title: 'Vente iPhone 13',
        subtitle: 'Par Marie K.',
        amount: 450000,
        timestamp: '2 min',
      },
      {
        id: '2',
        type: 'order',
        title: 'Nouvelle commande',
        subtitle: 'Commande #1234',
        amount: 85000,
        timestamp: '5 min',
      },
      {
        id: '3',
        type: 'customer',
        title: 'Nouveau client',
        subtitle: 'Jean-Paul M.',
        timestamp: '8 min',
      },
      {
        id: '4',
        type: 'sale',
        title: 'Vente Laptop',
        subtitle: 'Par David N.',
        amount: 320000,
        timestamp: '12 min',
      },
    ],
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setData(mockData);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount} FCFA`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-CM').format(num);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontFamily: 'System',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: string;
    color: string;
    delay?: number;
  }> = ({ title, value, change, icon, color, delay = 0 }) => (
    <AnimatedCard
      style={styles.metricCard}
      animated={!prefersReducedMotion}
      delay={delay}
    >
      <View style={styles.metricContent}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>{icon}</Text>
          <View style={[styles.metricIndicator, { backgroundColor: color }]} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        {change !== undefined && (
          <View style={styles.metricChange}>
            <Text style={[
              styles.metricChangeText,
              { color: change >= 0 ? '#059669' : '#DC2626' }
            ]}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          {t('analytics:loading')}
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t('common:error')}
        </Text>
        <AnimatedButton
          title={t('common:retry')}
          onPress={fetchAnalytics}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('analytics:dashboard.title')}
        </Text>
        <Text style={styles.subtitle}>
          {t('analytics:dashboard.description')}
        </Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {(['7d', '30d', '90d'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive
            ]}
            onPress={() => onTimeRangeChange(range)}
            accessibilityRole="button"
            accessibilityLabel={`${t(`analytics:timeRange.${range}`)}`}
            accessibilityState={{ selected: timeRange === range }}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === range && styles.timeRangeButtonTextActive
            ]}>
              {t(`analytics:timeRange.${range}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overview Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title={t('analytics:metrics.totalSales')}
          value={formatCurrency(data.overview.totalSales)}
          change={data.overview.growthRate}
          icon="💰"
          color="#10B981"
          delay={0}
        />
        <MetricCard
          title={t('analytics:metrics.totalOrders')}
          value={formatNumber(data.overview.totalOrders)}
          change={8.2}
          icon="📦"
          color="#3B82F6"
          delay={100}
        />
        <MetricCard
          title={t('analytics:metrics.totalCustomers')}
          value={formatNumber(data.overview.totalCustomers)}
          change={5.1}
          icon="👥"
          color="#8B5CF6"
          delay={200}
        />
        <MetricCard
          title={t('analytics:metrics.avgOrderValue')}
          value={formatCurrency(data.overview.averageOrderValue)}
          change={data.overview.conversionRate}
          icon="📊"
          color="#F59E0B"
          delay={300}
        />
      </View>

      {/* Chart Selector */}
      <View style={styles.chartSelector}>
        {(['sales', 'orders', 'categories'] as const).map((chart) => (
          <TouchableOpacity
            key={chart}
            style={[
              styles.chartSelectorButton,
              selectedChart === chart && styles.chartSelectorButtonActive
            ]}
            onPress={() => setSelectedChart(chart)}
            accessibilityRole="tab"
            accessibilityLabel={t(`analytics:charts.${chart}`)}
            accessibilityState={{ selected: selectedChart === chart }}
          >
            <Text style={[
              styles.chartSelectorButtonText,
              selectedChart === chart && styles.chartSelectorButtonTextActive
            ]}>
              {t(`analytics:charts.${chart}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Charts */}
      <AnimatedCard style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {t(`analytics:charts.${selectedChart}`)}
        </Text>
        
        {selectedChart === 'sales' && (
          <LineChart
            data={data.salesChart}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier={!prefersReducedMotion}
            style={styles.chart}
            withHorizontalLines={true}
            withVerticalLines={false}
            withInnerLines={false}
            withOuterLines={true}
            withDots={true}
            withShadow={!prefersReducedMotion}
            fromZero={true}
          />
        )}

        {selectedChart === 'orders' && (
          <BarChart
            data={data.ordersChart}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            withHorizontalLines={true}
            withVerticalLines={false}
            withInnerLines={false}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        )}

        {selectedChart === 'categories' && (
          <PieChart
            data={data.categoryChart}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            absolute={false}
            hasLegend={true}
          />
        )}
      </AnimatedCard>

      {/* Recent Activities */}
      <AnimatedCard style={styles.activitiesCard}>
        <Text style={styles.activitiesTitle}>
          {t('analytics:activities.recent')}
        </Text>
        
        <View style={styles.activitiesList}>
          {data.recentActivities.map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>
                  {activity.type === 'sale' ? '💰' : 
                   activity.type === 'order' ? '📦' : '👤'}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
              </View>
              <View style={styles.activityMeta}>
                {activity.amount && (
                  <Text style={styles.activityAmount}>
                    {formatCurrency(activity.amount)}
                  </Text>
                )}
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>
      </AnimatedCard>

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeRangeButtonTextActive: {
    color: '#3B82F6',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metricCard: {
    width: (screenWidth - 48) / 2,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metricContent: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartSelector: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  chartSelectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartSelectorButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartSelectorButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  chartSelectorButtonTextActive: {
    color: '#3B82F6',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  activitiesCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  activitiesList: {
    space: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 32,
  },
});

export default MobileAnalytics;
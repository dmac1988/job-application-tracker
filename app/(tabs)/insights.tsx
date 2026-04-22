import { useContext } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

const screenWidth = Dimensions.get('window').width - 36;

export default function InsightsScreen() {
  const context = useContext(AppContext);

  if (!context) return null;

  const { applications, categories, statusLogs } = context;

  // Applications by category
  const categoryData = categories.map((cat) => {
    const count = applications.filter((a) => a.categoryId === cat.id).length;
    return {
      name: cat.name,
      count,
      color: cat.colour,
      legendFontColor: '#374151',
      legendFontSize: 13,
    };
  }).filter((item) => item.count > 0);

  // Status breakdown - get latest status per application
  const latestStatuses: Record<string, number> = {};
  applications.forEach((app) => {
    const appLogs = statusLogs
      .filter((l) => l.applicationId === app.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const latest = appLogs.length > 0 ? appLogs[0].status : 'Unknown';
    latestStatuses[latest] = (latestStatuses[latest] || 0) + 1;
  });

  const statusColours: Record<string, string> = {
    Applied: '#3B82F6',
    Interviewing: '#F59E0B',
    Offered: '#10B981',
    Rejected: '#EF4444',
    Withdrawn: '#8B5CF6',
    Unknown: '#94A3B8',
  };

  const statusData = Object.entries(latestStatuses).map(([status, count]) => ({
    name: status,
    count,
    color: statusColours[status] || '#94A3B8',
    legendFontColor: '#374151',
    legendFontSize: 13,
  }));

  // Applications per month
  const monthCounts: Record<string, number> = {};
  applications.forEach((app) => {
    const month = app.date.substring(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthCounts).sort();
  const barData = {
    labels: sortedMonths.map((m) => m.substring(5)),
    datasets: [
      {
        data: sortedMonths.map((m) => monthCounts[m]),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
    labelColor: () => '#374151',
    style: {
      borderRadius: 14,
    },
  };

  // Summary stats
  const totalApps = applications.length;
  const topCategory = categoryData.length > 0
    ? categoryData.reduce((a, b) => (a.count > b.count ? a : b)).name
    : 'None';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your application analytics</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalApps}</Text>
            <Text style={styles.statLabel}>Total Apps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Object.keys(latestStatuses).length}</Text>
            <Text style={styles.statLabel}>Statuses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Most applied category</Text>
          <Text style={styles.statHighlight}>{topCategory}</Text>
        </View>

        {categoryData.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Applications by Category</Text>
            <PieChart
              data={categoryData}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="10"
            />
          </View>
        ) : null}

        {statusData.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Status Breakdown</Text>
            <PieChart
              data={statusData}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="10"
            />
          </View>
        ) : null}

        {sortedMonths.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Applications Per Month</Text>
            <BarChart
              data={barData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 14,
    marginBottom: 10,
  },
  statNumber: {
    color: '#0F766E',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  statHighlight: {
    color: '#0F766E',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  chartTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 14,
  },
});
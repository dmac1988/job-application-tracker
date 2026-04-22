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
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.id - a.id;
      });
    const latest = appLogs.length > 0 ? appLogs[0].status : 'Unknown';
    latestStatuses[latest] = (latestStatuses[latest] || 0) + 1;
  });

  const statusColours: Record<string, string> = {
    Applied: '#2563EB',
    Interviewing: '#D97706',
    Offered: '#059669',
    Rejected: '#DC2626',
    Withdrawn: '#7C3AED',
    Unknown: '#94A3B8',
  };

  const statusData = Object.entries(latestStatuses).map(([status, count]) => ({
    name: status,
    count,
    color: statusColours[status] || '#94A3B8',
    legendFontColor: '#374151',
    legendFontSize: 13,
  }));

  // Applications per month - use all applications
  const monthCounts: Record<string, number> = {};
  applications.forEach((app) => {
    if (app.date && app.date.length >= 7) {
      const month = app.date.substring(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthCounts).sort();

  const barLabels = sortedMonths.map((m) => {
    const parts = m.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return monthNames[monthIndex] || parts[1];
  });

  const barData = {
    labels: barLabels,
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
    color: (opacity = 1) => `rgba(30, 58, 95, ${opacity})`,
    labelColor: () => '#374151',
    style: {
      borderRadius: 10,
    },
    barPercentage: 0.6,
  };

  // Summary stats
  const totalApps = applications.length;
  const topCategory = categoryData.length > 0
    ? categoryData.reduce((a, b) => (a.count > b.count ? a : b)).name
    : 'None';
  const interviewCount = latestStatuses['Interviewing'] || 0;
  const offerCount = latestStatuses['Offered'] || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your application analytics</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalApps}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{interviewCount}</Text>
            <Text style={styles.statLabel}>Interviewing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#059669' }]}>{offerCount}</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
        </View>

        <View style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>Most applied category</Text>
          <Text style={styles.highlightValue}>{topCategory}</Text>
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
            <Text style={styles.chartSubtitle}>
              {sortedMonths.map((m, i) => `${barLabels[i]}: ${monthCounts[m]}`).join('  ·  ')}
            </Text>
            <BarChart
              data={barData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  title: {
    color: '#1A1A2E',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statNumber: {
    color: '#1E3A5F',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  highlightCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
  },
  highlightLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  highlightValue: {
    color: '#1E3A5F',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  chartTitle: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
  },
});
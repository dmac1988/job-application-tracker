import { useContext } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

const screenWidth = Dimensions.get('window').width - 36;

export default function InsightsScreen() {
  const context = useContext(AppContext);
  if (!context) return null;

  const { applications, categories, statusLogs, colors, darkMode } = context;

  const categoryData = categories.map((cat) => {
    const count = applications.filter((a) => a.categoryId === cat.id).length;
    return { name: cat.name, count, color: cat.colour, legendFontColor: colors.textSecondary, legendFontSize: 13 };
  }).filter((item) => item.count > 0);

  const latestStatuses: Record<string, number> = {};
  applications.forEach((app) => {
    const appLogs = statusLogs.filter((l) => l.applicationId === app.id).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id - a.id;
    });
    const latest = appLogs.length > 0 ? appLogs[0].status : 'Unknown';
    latestStatuses[latest] = (latestStatuses[latest] || 0) + 1;
  });

  const statusColours: Record<string, string> = { Applied: '#2563EB', Interviewing: '#D97706', Offered: '#059669', Rejected: '#DC2626', Withdrawn: '#7C3AED', Unknown: '#94A3B8' };
  const statusData = Object.entries(latestStatuses).map(([status, count]) => ({
    name: status, count, color: statusColours[status] || '#94A3B8', legendFontColor: colors.textSecondary, legendFontSize: 13,
  }));

  const monthCounts: Record<string, number> = {};
  applications.forEach((app) => {
    if (app.date && app.date.length >= 7) {
      const month = app.date.substring(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthCounts).sort();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const barLabels = sortedMonths.map((m) => {
    const monthIndex = parseInt(m.split('-')[1], 10) - 1;
    return monthNames[monthIndex] || m.split('-')[1];
  });

  const barData = { labels: barLabels, datasets: [{ data: sortedMonths.map((m) => monthCounts[m]) }] };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => darkMode ? `rgba(59, 130, 246, ${opacity})` : `rgba(30, 58, 95, ${opacity})`,
    labelColor: () => colors.textSecondary,
    style: { borderRadius: 4 },
    barPercentage: 0.6,
  };

  const totalApps = applications.length;
  const topCategory = categoryData.length > 0 ? categoryData.reduce((a, b) => (a.count > b.count ? a : b)).name : 'None';
  const interviewCount = latestStatuses['Interviewing'] || 0;
  const offerCount = latestStatuses['Offered'] || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your application analytics</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{totalApps}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{interviewCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Interviewing</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#059669' }]}>{offerCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Offers</Text>
          </View>
        </View>

        <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>Most applied category</Text>
          <Text style={[styles.highlightValue, { color: colors.primary }]}>{topCategory}</Text>
        </View>

        {categoryData.length > 0 ? (
          <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Applications by Category</Text>
            <PieChart data={categoryData} width={screenWidth} height={200} chartConfig={chartConfig} accessor="count" backgroundColor="transparent" paddingLeft="10" />
          </View>
        ) : null}

        {statusData.length > 0 ? (
          <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Status Breakdown</Text>
            <PieChart data={statusData} width={screenWidth} height={200} chartConfig={chartConfig} accessor="count" backgroundColor="transparent" paddingLeft="10" />
          </View>
        ) : null}

        {sortedMonths.length > 0 ? (
          <View style={[styles.chartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Applications Per Month</Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>{sortedMonths.map((m, i) => `${barLabels[i]}: ${monthCounts[m]}`).join('  ·  ')}</Text>
            <BarChart data={barData} width={screenWidth} height={220} chartConfig={chartConfig} style={styles.chart} yAxisLabel="" yAxisSuffix="" fromZero />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { borderRadius: 4, borderWidth: 1, flex: 1, padding: 14 },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  highlightCard: { borderRadius: 4, borderWidth: 1, marginTop: 10, padding: 14 },
  highlightLabel: { fontSize: 13, fontWeight: '500' },
  highlightValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  chartSection: { borderRadius: 4, borderWidth: 1, marginTop: 14, padding: 14 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  chartSubtitle: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  chart: { borderRadius: 4 },
});
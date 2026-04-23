import ApplicationCard from '@/components/ApplicationCard';
import { Redirect, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  if (!context) return null;

  if (!context.user) {
    return <Redirect href="/login" />;
  }

  const { applications, categories, colors } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryOptions = [
    'All',
    ...categories.map((c) => c.name),
  ];

  const hasFilters = normalizedQuery.length > 0 || selectedCategory !== 'All' || dateFrom !== '' || dateTo !== '';

  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      app.company.toLowerCase().includes(normalizedQuery) ||
      app.role.toLowerCase().includes(normalizedQuery);

    const category = categories.find((c) => c.id === app.categoryId);
    const matchesCategory =
      selectedCategory === 'All' || category?.name === selectedCategory;

    const matchesDateFrom = !dateFrom || app.date >= dateFrom;
    const matchesDateTo = !dateTo || app.date <= dateTo;

    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Applications</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {applications.length} total{hasFilters ? ` · ${filteredApplications.length} shown` : ''}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityLabel="Add application"
            accessibilityRole="button"
            onPress={() => router.push('/add')}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.addButtonText, { color: colors.primaryText }]}>+ New</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Browse remote jobs"
            accessibilityRole="button"
            onPress={() => router.push('/browse')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Jobs</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Toggle filters"
            accessibilityRole="button"
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterToggle, { borderColor: hasFilters ? '#DC2626' : colors.inputBorder }]}
          >
            <Text style={[styles.filterToggleText, { color: hasFilters ? '#DC2626' : colors.text }]}>
              {showFilters ? 'Hide' : 'Filters'}{hasFilters ? ' ●' : ''}
            </Text>
          </Pressable>
        </View>

        {showFilters ? (
          <View style={[styles.filtersPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by company or role..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              accessibilityLabel="Search applications"
            />

            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.text }]}>From</Text>
                <TextInput
                  value={dateFrom}
                  onChangeText={setDateFrom}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.dateInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  accessibilityLabel="Filter from date"
                />
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.text }]}>To</Text>
                <TextInput
                  value={dateTo}
                  onChangeText={setDateTo}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.dateInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                  accessibilityLabel="Filter to date"
                />
              </View>
            </View>

            <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
            <View style={styles.filterRow}>
              {categoryOptions.map((name) => {
                const isSelected = selectedCategory === name;
                const cat = categories.find((c) => c.name === name);
                return (
                  <Pressable
                    key={name}
                    accessibilityLabel={`Filter by ${name}`}
                    accessibilityRole="button"
                    onPress={() => setSelectedCategory(name)}
                    style={[
                      styles.filterButton,
                      { borderColor: colors.inputBorder },
                      isSelected && {
                        backgroundColor: cat ? cat.colour : colors.primary,
                        borderColor: cat ? cat.colour : colors.primary,
                      },
                    ]}
                  >
                    {cat && !isSelected ? (
                      <View style={[styles.filterDot, { backgroundColor: cat.colour }]} />
                    ) : null}
                    <Text
                      style={[
                        styles.filterButtonText,
                        { color: colors.text },
                        isSelected && styles.filterButtonTextSelected,
                      ]}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {hasFilters ? (
              <Pressable
                accessibilityLabel="Clear all filters"
                accessibilityRole="button"
                onPress={clearFilters}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear all filters</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No applications yet</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              Tap "+ New" above to start tracking your job search.
            </Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matches</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              Nothing matches your current filters. Try broadening your search or clearing filters.
            </Text>
          </View>
        ) : (
          filteredApplications.map((app: Application) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 4,
    flex: 1,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  browseButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D97706',
    borderRadius: 4,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#D97706',
    fontSize: 15,
    fontWeight: '600',
  },
  filterToggle: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filtersPanel: {
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  searchInput: {
    borderRadius: 4,
    borderWidth: 1.5,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    borderRadius: 4,
    borderWidth: 1.5,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
});
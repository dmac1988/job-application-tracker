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

  if (!context) return null;

  if (!context.user) {
    return <Redirect href="/login" />;
  }

  const { applications, categories } = context;
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>
          {applications.length} total{hasFilters ? ` · ${filteredApplications.length} shown` : ''}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Add application"
        accessibilityRole="button"
        onPress={() => router.push('/add')}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ New Application</Text>
      </Pressable>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by company or role..."
        style={styles.searchInput}
        accessibilityLabel="Search applications"
      />

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>From</Text>
          <TextInput
            value={dateFrom}
            onChangeText={setDateFrom}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            accessibilityLabel="Filter from date"
          />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>To</Text>
          <TextInput
            value={dateTo}
            onChangeText={setDateTo}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            accessibilityLabel="Filter to date"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {categoryOptions.map((name) => {
            const isSelected = selectedCategory === name;
            return (
              <Pressable
                key={name}
                accessibilityLabel={`Filter by ${name}`}
                accessibilityRole="button"
                onPress={() => setSelectedCategory(name)}
                style={[
                  styles.filterButton,
                  isSelected && styles.filterButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextSelected,
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

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

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyMessage}>
              Tap "+ New Application" above to start tracking your job search.
            </Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyMessage}>
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
    backgroundColor: '#F9FAFB',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    marginBottom: 14,
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
  addButton: {
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
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
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterScroll: {
    marginTop: 10,
    maxHeight: 44,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#1E3A5F',
    borderColor: '#1E3A5F',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMessage: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
});
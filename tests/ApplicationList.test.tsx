import { render } from '@testing-library/react-native';
import React from 'react';
import IndexScreen from '../app/(tabs)/index';
import { AppContext } from '../app/_layout';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  Redirect: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const mockContext = {
  user: { id: 1, username: 'testuser', password: 'pass' },
  setUser: jest.fn(),
  categories: [
    { id: 1, name: 'Frontend', colour: '#3B82F6' },
    { id: 2, name: 'Backend', colour: '#10B981' },
  ],
  setCategories: jest.fn(),
  applications: [
    { id: 1, company: 'Google', role: 'Frontend Engineer', date: '2026-04-01', categoryId: 1, count: 1, notes: '' },
    { id: 2, company: 'Stripe', role: 'Backend Developer', date: '2026-04-05', categoryId: 2, count: 1, notes: '' },
  ],
  setApplications: jest.fn(),
  statusLogs: [
    { id: 1, applicationId: 1, status: 'Applied', date: '2026-04-01' },
    { id: 2, applicationId: 2, status: 'Applied', date: '2026-04-05' },
  ],
  setStatusLogs: jest.fn(),
  targets: [],
  setTargets: jest.fn(),
};

describe('IndexScreen', () => {
  it('renders applications and the add button', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={mockContext}>
        <IndexScreen />
      </AppContext.Provider>
    );

    expect(getByLabelText('Google, Frontend Engineer, status Applied, view details')).toBeTruthy();
    expect(getByLabelText('Stripe, Backend Developer, status Applied, view details')).toBeTruthy();
    expect(getByLabelText('Add application')).toBeTruthy();
  });

  it('shows the search input', () => {
    const { getByLabelText } = render(
      <AppContext.Provider value={mockContext}>
        <IndexScreen />
      </AppContext.Provider>
    );

    expect(getByLabelText('Search applications')).toBeTruthy();
  });
});
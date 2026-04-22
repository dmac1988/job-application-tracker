jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/sqlite-core', () => ({
  sqliteTable: jest.fn((name, columns) => ({ ...columns, _name: name })),
  text: jest.fn(() => ({
    notNull: jest.fn().mockReturnThis(),
    default: jest.fn().mockReturnThis(),
  })),
  integer: jest.fn(() => ({
    primaryKey: jest.fn().mockReturnThis(),
    notNull: jest.fn().mockReturnThis(),
    default: jest.fn().mockReturnThis(),
  })),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  Redirect: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));
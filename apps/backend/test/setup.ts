import { beforeAll, afterAll } from 'vitest';

// Set test environment variables before any module loads
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/foodjet_test';
process.env.TELEGRAM_BOT_TOKEN = 'test:fake-bot-token-for-testing';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-16-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '0';

beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  // Global test teardown
});

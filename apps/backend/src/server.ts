import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { startBot, bot } from './modules/notification/bot.js';

async function main() {
  await connectDatabase();
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`Server started on port ${env.PORT} (${env.NODE_ENV})`);
  } catch (err) {
    logger.fatal(err, 'Failed to start server');
    await disconnectDatabase();
    process.exit(1);
  }

  // Start Telegram bot (non-blocking)
  await startBot();

  const shutdown = async () => {
    logger.info('Shutting down...');
    bot.stop();
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();

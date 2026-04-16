import { Bot, InlineKeyboard } from 'grammy';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { prisma } from '../../config/database.js';

// ---------------------------------------------------------------------------
// Bot instance
// ---------------------------------------------------------------------------

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

const isHttps = env.MINI_APP_URL.startsWith('https://');

// ---------------------------------------------------------------------------
// Helper: build store keyboard (WebApp if HTTPS, regular URL otherwise)
// ---------------------------------------------------------------------------

function buildStoreKeyboard(storeName: string, storeSlug: string): InlineKeyboard {
  const url = `${env.MINI_APP_URL}?store=${storeSlug}`;
  const kb = new InlineKeyboard();

  if (isHttps) {
    kb.webApp(`Открыть ${storeName}`, url);
  } else {
    kb.url(`Открыть ${storeName}`, url);
  }

  return kb;
}

// ---------------------------------------------------------------------------
// /start command — deep link with store slug
// ---------------------------------------------------------------------------

bot.command('start', async (ctx) => {
  const payload = ctx.match; // deep link parameter (store slug)

  if (payload) {
    const store = await prisma.store.findUnique({
      where: { slug: payload },
      include: { settings: true },
    });

    if (!store) {
      await ctx.reply('К сожалению, магазин не найден. Проверьте ссылку и попробуйте снова.');
      return;
    }

    await ctx.reply(
      `Добро пожаловать в ${store.name}! 🎉\n\nНажмите кнопку ниже, чтобы открыть магазин и сделать заказ.`,
      { reply_markup: buildStoreKeyboard(store.name, store.slug) },
    );
  } else {
    const store = await prisma.store.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (store) {
      await ctx.reply(
        `Добро пожаловать в FoodJet! 🚀\n\nНажмите кнопку ниже, чтобы перейти в магазин и сделать заказ.`,
        { reply_markup: buildStoreKeyboard(store.name, store.slug) },
      );
    } else {
      await ctx.reply(
        'Добро пожаловать в FoodJet! 🚀\n\nК сожалению, сейчас нет доступных магазинов. Попробуйте позже.',
      );
    }
  }
});

// ---------------------------------------------------------------------------
// /help command
// ---------------------------------------------------------------------------

bot.command('help', async (ctx) => {
  await ctx.reply(
    'FoodJet — сервис доставки продуктов.\n\n' +
      'Доступные команды:\n' +
      '/start — открыть магазин\n' +
      '/help — справка\n' +
      '/support — контакты поддержки',
  );
});

// ---------------------------------------------------------------------------
// /support command
// ---------------------------------------------------------------------------

bot.command('support', async (ctx) => {
  await ctx.reply(
    'Если у вас есть вопросы или проблемы с заказом, свяжитесь с поддержкой магазина через Mini App ' +
      'или напишите нам: @foodjet_support',
  );
});

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

bot.catch((err) => {
  logger.error({ error: err.error, ctx: err.ctx?.update }, 'Bot error');
});

// ---------------------------------------------------------------------------
// Set up bot commands and Menu Button
// ---------------------------------------------------------------------------

async function setupBot(): Promise<void> {
  await bot.api.setMyCommands([
    { command: 'start', description: 'Открыть магазин' },
    { command: 'help', description: 'Справка' },
    { command: 'support', description: 'Поддержка' },
  ]);

  if (isHttps) {
    try {
      await bot.api.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: 'Магазин',
          web_app: { url: env.MINI_APP_URL },
        },
      });
      logger.info('Menu button configured (WebApp)');
    } catch (error) {
      logger.warn({ error }, 'Failed to set menu button');
    }
  } else {
    logger.info('Mini App URL is not HTTPS — skipping WebApp menu button, using URL buttons instead');
  }
}

// ---------------------------------------------------------------------------
// Start bot
// ---------------------------------------------------------------------------

export async function startBot(): Promise<void> {
  try {
    logger.info('Starting Telegram bot...');
    await setupBot();
    bot.start({
      onStart: () => {
        logger.info('Telegram bot started (long polling)');
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start Telegram bot');
    throw error;
  }
}

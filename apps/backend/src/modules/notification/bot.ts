import { Bot, InlineKeyboard } from 'grammy';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { prisma } from '../../config/database.js';

// ---------------------------------------------------------------------------
// Bot instance
// ---------------------------------------------------------------------------

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// ---------------------------------------------------------------------------
// /start command — deep link with store slug
// ---------------------------------------------------------------------------

bot.command('start', async (ctx) => {
  const payload = ctx.match; // deep link parameter (store slug)

  if (payload) {
    // Look up store by slug
    const store = await prisma.store.findUnique({
      where: { slug: payload },
      include: { settings: true },
    });

    if (!store) {
      await ctx.reply('К сожалению, магазин не найден. Проверьте ссылку и попробуйте снова.');
      return;
    }

    const miniAppUrl = `${env.CORS_ORIGIN}/${store.slug}`;

    const keyboard = new InlineKeyboard().webApp(
      `Открыть ${store.name}`,
      miniAppUrl,
    );

    await ctx.reply(
      `Добро пожаловать в ${store.name}! 🎉\n\nНажмите кнопку ниже, чтобы открыть магазин и сделать заказ.`,
      { reply_markup: keyboard },
    );
  } else {
    await ctx.reply(
      'Добро пожаловать в FoodJet! 🚀\n\n' +
        'Чтобы начать заказ, перейдите по ссылке магазина или нажмите кнопку «Меню» внизу.',
    );
  }
});

// ---------------------------------------------------------------------------
// /help command
// ---------------------------------------------------------------------------

bot.command('help', async (ctx) => {
  await ctx.reply(
    'FoodJet — сервис доставки еды.\n\n' +
      'Доступные команды:\n' +
      '/start — начать работу с ботом\n' +
      '/help — справка\n' +
      '/support — контакты поддержки\n\n' +
      'Для заказа откройте Mini App через кнопку «Меню» или перейдите по ссылке магазина.',
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
// Start bot
// ---------------------------------------------------------------------------

export async function startBot(): Promise<void> {
  try {
    logger.info('Starting Telegram bot...');
    // Use long polling — suitable for development and small deployments
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

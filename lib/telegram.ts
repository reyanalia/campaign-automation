import TelegramBot from "node-telegram-bot-api";

let bot: TelegramBot | null = null;

function getBot(): TelegramBot | null {
  if (!process.env.TELEGRAM_BOT_TOKEN) return null;
  if (!bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

export async function sendTelegramAlert(message: string): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.log("[Telegram] No TELEGRAM_CHAT_ID set, skipping alert:", message);
    return;
  }
  const telegramBot = getBot();
  if (!telegramBot) {
    console.log("[Telegram] No TELEGRAM_BOT_TOKEN set, skipping alert:", message);
    return;
  }
  try {
    await telegramBot.sendMessage(chatId, `🚨 *Campaign Alert*\n\n${message}`, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error("[Telegram] Failed to send alert:", err);
  }
}

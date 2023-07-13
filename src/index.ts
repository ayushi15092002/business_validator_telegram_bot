import dotenv from "dotenv";
dotenv.config();

import { handleIncomingMessage } from "./handlers/message";

import { Telegraf } from "telegraf";
// import { existsSync, mkdirSync } from "fs";

// Config
import { initAiConfig } from "./handlers/ai-config";
import { initOpenAI } from "./providers/openai";
import config from "./config";


const telegramToken = process.env.TELEGRAM_TOKEN!;
// Ready timestamp of the bot
let botReadyTimestamp: Date | null = null;
initAiConfig();
initOpenAI();
const bot = new Telegraf(telegramToken, {handlerTimeout: 9_000_000});
// const bot = new Telegraf(telegramToken);

bot.start((ctx) => {
  ctx.reply("Welcome to my Telegram bot!");
});

bot.help((ctx) => {
  ctx.reply("Send me a message and I will echo it back to you.");
});


//pre prompt
if(config.prePrompt != null && config.prePrompt.trim() != ""){
  const response = await handleIncomingMessage(config.prePrompt.toString());
  console.log("response preprompt  "+ response);
}



bot.on("message", async (ctx) => {
  const text = (ctx.message as any).text;

  if (!text) {
    ctx.reply("Please send a text message.");
    return;
  }

  console.log("Input: ", text);

  await ctx.sendChatAction("typing");
  try {
    console.log ("text " + text);
    const response = await handleIncomingMessage(text);
    console.log("response "+ response);
    await ctx.reply(response);

  } catch (error) {
    console.log(error);

    const message = JSON.stringify(
      (error as any)?.response?.data?.error ?? "Unable to extract error"
    );

    console.log({ message });

    await ctx.reply(
      "Whoops! There was an error while talking to OpenAI. Error: " + message
    );
  }
});

bot.launch().then(() => {
  console.log("Bot launched");
});

process.on("SIGTERM", () => {
  bot.stop();
});

export { botReadyTimestamp };

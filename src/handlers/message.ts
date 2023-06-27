import { startsWithIgnoreCase } from "../utils";

// Config & Constants
import config from "../config";

// CLI
import * as cli from "../cli/ui";

// ChatGPT & DALLE
import { handleMessageGPT, handleDeleteConversation } from "../handlers/gpt";
import { handleMessageAIConfig, getConfig, executeCommand } from "../handlers/ai-config";
import { handleMessageLangChain } from "../handlers/langchain";

// Speech API & Whisper
import { transcribeOpenAI } from "../providers/openai";

// For deciding to ignore old messages
import { botReadyTimestamp } from "../index";


// Handles message
async function handleIncomingMessage(message: String) {
	let messageString = message;
		console.log("messageString "+messageString);

	// Clear conversation context (!clear)
	if (startsWithIgnoreCase(messageString, config.resetPrefix)) {
		// await handleDeleteConversation(message);
		return;
	}

	// AiConfig (!config <args>)
	if (startsWithIgnoreCase(messageString, config.aiConfigPrefix)) {
		const prompt = messageString.substring(config.aiConfigPrefix.length + 1);
		// await handleMessageAIConfig(message, prompt);
		return;
	}

	// GPT (!gpt <prompt>)
	if (startsWithIgnoreCase(messageString, config.gptPrefix)) {
		const prompt = messageString.substring(config.gptPrefix.length + 1);
		let rep = await handleMessageGPT(prompt);
		return rep;
	}

	// GPT (!lang <prompt>)
	if (startsWithIgnoreCase(messageString, config.langChainPrefix)) {

		const prompt = messageString.substring(config.langChainPrefix.length + 1);
		let rep = await handleMessageLangChain(prompt);
		return rep;
	}


	// Lang (only <prompt>)
	if (!config.prefixEnabled || (config.prefixSkippedForMe)) {

		const prompt = messageString.substring(config.langChainPrefix.length + 1);
		let rep = await handleMessageLangChain(prompt);
		return rep;
	}
}

export { handleIncomingMessage };

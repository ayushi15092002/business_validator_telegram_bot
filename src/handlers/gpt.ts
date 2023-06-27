import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Message, MessageMedia } from "whatsapp-web.js";
import { chatgpt } from "../providers/openai";
import * as cli from "../cli/ui";
import config from "../config";

// TTS
import { ttsRequest as awsTTSRequest } from "../providers/aws";
import { TTSMode } from "../types/tts-mode";

// Moderation
import { moderateIncomingPrompt } from "./moderation";
import { aiConfig, getConfig } from "./ai-config";

// Mapping from number to last conversation id
const conversations: any[] = [];

const handleMessageGPT = async (prompt: string) => {
	try {
		// Get last conversation
		const lastConversationId = conversations[conversations.length-1];

		// cli.print(`[GPT] Received prompt from ${message.from}: ${prompt}`);
		cli.print(`[GPT] Received prompt from : ${prompt}`);

		// Prompt Moderation
		if (config.promptModerationEnabled) {
			try {
				await moderateIncomingPrompt(prompt);
			} catch (error: any) {
				// message.reply(error.message);
				return error.message;
			}
		}

		const start = Date.now();

		// Check if we have a conversation with the user
		let response: string;
		if (lastConversationId) {
			// Handle message with previous conversation
			response = await chatgpt.ask(prompt, lastConversationId);
		} else {
			// Create new conversation
			const convId = randomUUID();
			const conv = chatgpt.addConversation(convId);

			// Set conversation
			// conversations[message.from] = conv.id;
			conversations.push(conv.id);

			// cli.print(`[GPT] New conversation for ${message.from} (ID: ${conv.id})`);

			cli.print(`[GPT] New conversation for (ID: ${conv.id})`);

			// Pre prompt
			if (config.prePrompt != null && config.prePrompt.trim() != "") {
				cli.print(`[GPT] Pre prompt: ${config.prePrompt}`);
				const prePromptResponse = await chatgpt.ask(config.prePrompt, conv.id);
				cli.print("[GPT] Pre prompt response: " + prePromptResponse);
			}

			// Handle message with new conversation
			response = await chatgpt.ask(prompt, conv.id);
		}


		const end = Date.now() - start;

		// cli.print(`[GPT] Answer to ${message.from}: ${response}  | OpenAI request took ${end}ms)`);

		cli.print(`[GPT] Answer to : ${response}  | OpenAI request took ${end}ms)`);


		// TTS reply (Default: disabled)
		if (getConfig("tts", "enabled")) {
			// sendVoiceMessageReply(message, response);
			// Default: Text reply
			// message.reply(response);
			return response;
		}

		// Default: Text reply
		// message.reply(response);
		return response;
	} catch (error: any) {
		console.error("An error occured", error);
		// message.reply("An error occured, please contact the administrator. (" + error.message + ")");
		return "An error occured, please contact the administrator. (" + error.message + ")";
	}
};

const handleDeleteConversation = async (message: Message) => {
	// Delete conversation
	delete conversations[message.from];

	// Reply
	message.reply("Conversation context was resetted!");
};


export { handleMessageGPT, handleDeleteConversation };

import BrowserAgentProvider from "../providers/browser-agent";
import * as cli from "../cli/ui";
import config from "../config";


// Moderation
import { moderateIncomingPrompt } from "./moderation";
import { aiConfig, getConfig } from "./ai-config";

const browserAgent = new BrowserAgentProvider();

// TODO add conversation ID to build a chat history
const handleMessageLangChain = async (prompt: string) => {
	try {
		const start = Date.now();

		// Pre prompt
		// if (config.prePrompt != null && config.prePrompt.trim() != "") {
			
		// 	cli.print(`[GPT] Pre prompt: ${config.prePrompt}`);
		// 	const prePromptResponse = await browserAgent.call(config.prePrompt);
		// 	cli.print("[GPT] Pre prompt response: " + prePromptResponse);
		// }

		const output = await browserAgent.call(prompt);
		const end = Date.now() - start;

		cli.print(`[GPT] Answer to : ${output}  | OpenAI request took ${end}ms)`);

		// Default: Text reply
		// message.reply(output.toString());
		return output.toString();
	} catch (error: any) {
		console.error("An error occured", error);
		// message.reply("An error occured, please contact the administrator. (" + error.message + ")");
	}
};

export { handleMessageLangChain};





import { OpenAI } from "langchain/llms";
import { SerpAPI } from "langchain/tools";
import { AgentExecutor,  initializeAgentExecutor, initializeAgentExecutorWithOptions, AgentExecutorInput} from "langchain/agents";
import { BufferMemory } from "langchain/memory";
import{Tool } from "langchain/tools";
import * as cli from "../cli/ui";
import config from "../config";


export default class BrowserAgentProvider { 
	public tools: Tool[]; 
	public executor?: AgentExecutor; 
	public model: OpenAI;

	constructor() {

		this.tools = [ new SerpAPI() ] 
		this.model = new OpenAI({modelName:"gpt-3.5-turbo-16k",temperature: 0.4}) 
	}

	public async call(input: string) { 
		if (!this.executor) {
			this.executor = await initializeAgentExecutor( 
				this.tools, 
				this.model, 
				"chat-conversational-react-description", 
				true, 
			);

		this.executor.memory = new BufferMemory({ returnMessages: true, memoryKey: "chat_history", inputKey: "input", }); 
  
		  // Pre prompt
		//   if (config.prePrompt != null && config.prePrompt.trim() != "") {
		// 	  cli.print(`[GPT] Pre prompt: ${config.prePrompt}`);
		// 	  const prePrompt = config.prePrompt.toString();
		// 	  const prePromptResponse = await this.executor!.call({input : prePrompt});
		// 	  cli.print("[GPT] Pre prompt response: " + prePromptResponse.output);
		//   }
	
	}

		const response = await this.executor!.call({ input });

		console.log("response inside brower agent " , response.output);

		return response.output;

	} 
}




import { ICommandsMap } from "./commands";

export enum aiConfigTarget {
	dalle = "dalle"
	// chatgpt = "chatgpt"
}



export interface IAiConfig {
	
	commandsMap: {
		[key: string]: ICommandsMap;
	};
}

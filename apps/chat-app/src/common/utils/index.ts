import dotenv from 'dotenv';
import fs from 'fs';
import type { IEnvConfig } from '@chat-types/index';
import path from 'path';

export function getEnvConfig(path): IEnvConfig {
	let envConfig: IEnvConfig = {};
	if (fs.existsSync(path)) {
		envConfig = dotenv.parse(fs.readFileSync(path)) || ({} as IEnvConfig);
	}
	return envConfig;
}

export const runtimeEnv = getEnvConfig(path.resolve(process.cwd(), '.env'));
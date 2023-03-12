import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { userConfig } from '@chat/config';
import { getEnvConfig } from '@chat-common/utils';

export interface GlobalConfig {
	holder?: string;
}

export interface EnvConfig {
	holder?: string;
}


@Injectable()
export class ConfigService {
	private globalConfig: GlobalConfig & EnvConfig;
	private envPath: string = path.resolve(process.cwd(), '.env');

	constructor() {
		const envConfig: EnvConfig = getEnvConfig(this.envPath);
		this.globalConfig = Object.assign(
			{},
			userConfig,
			envConfig as EnvConfig,
		) as GlobalConfig & EnvConfig;
	}

	get<K extends keyof (GlobalConfig & EnvConfig)>(key: K) {
		return this.globalConfig[key];
	}

	set(key: string, value: any): void {
		this.globalConfig[key] = value;
	}
}

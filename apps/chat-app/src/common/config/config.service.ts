import { Injectable } from '@nestjs/common';
import { userConfig } from '@chat/config';
import { runtimeEnv } from '@chat-common/utils';
import type { IEnvConfig } from '@chat-types/index'

export type GlobalConfig = typeof userConfig & IEnvConfig

@Injectable()
export class ConfigService {
	private globalConfig: GlobalConfig;

	constructor() {
		this.globalConfig = Object.assign(
			{},
			userConfig,
			runtimeEnv,
		);
	}

	get<K extends keyof (GlobalConfig)>(key: K) {
		return this.globalConfig[key];
	}

	set(key: string, value: any): void {
		this.globalConfig[key] = value;
	}
}

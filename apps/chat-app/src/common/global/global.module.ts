import { Module, Global } from '@nestjs/common';
import LoggerModule from '../logger/logger.module';
import ConfigModule from '@chat-common/config/config.module';

@Global()
@Module({
	imports: [LoggerModule, ConfigModule],
	exports: [LoggerModule, ConfigModule]
})
export default class GlobalModule {}

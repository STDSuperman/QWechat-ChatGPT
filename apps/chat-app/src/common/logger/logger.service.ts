import { Injectable, Logger as AppLogger } from '@nestjs/common';
import { LowDbService } from '../db/db.service';
import * as UUID from 'uuid';
import consola from 'consola'
@Injectable()
export class LoggerService extends AppLogger {
	constructor(private lowDB: LowDbService) {
		super();
	}

	warn(...args: unknown[]): void {
		consola.warn('warn: ', ...args);
	}

	info(...args: unknown[]): void {
		consola.info('info: ', ...args);
	}

	error(...args: unknown[]): void {
		consola.error('error: ', ...args);
		this.lowDB.pushOne('errorLogs', {
			message: args.join('\n'),
			dateString: new Date().toLocaleString(),
			timestamp: new Date().getTime(),
			id: UUID.v1()
		});
	}

	log(...args: unknown[]): void {
		consola.log('log: ', ...args);
	}

	debug(...args: unknown[]): void {
		consola.debug('debug: ', ...args);
	}

	readErrorLog(pageNum, pageSize = 20, sort) {
		return this.lowDB.readRecentData('errorLogs', pageSize, pageNum, sort);
	}

	readErrorLogSize() {
		return this.lowDB.getDataSize('errorLogs');
	}
}

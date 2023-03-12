import { Injectable, Logger as AppLogger } from '@nestjs/common';
import winston from 'winston';
import Transport from 'winston-transport';
import { LowDbService } from '../db/db.service';
import UUID from 'uuid';
@Injectable()
export class LoggerService extends AppLogger {
	private logger: winston.Logger;
	constructor(private lowDB: LowDbService) {
		super();
		this.logger = winston.createLogger({
			format: winston.format.json(),
			transports: [
				new DBTransport({ LowDBInstance: this.lowDB }),
				new winston.transports.Console({
					format: winston.format.combine(
						winston.format.colorize(),
						winston.format.simple(),
						winston.format.timestamp(),
						winston.format.prettyPrint()
					)
				})
			],
			handleExceptions: true
		});
	}

	warn(message: string | Record<string, unknown>): void {
		this.logger.warn(this.formatMessageData(message));
	}

	error(message: string | Record<string, unknown>): void {
		this.logger.error(this.formatMessageData(message));
	}

	log(message: string | Record<string, unknown>): void {
		this.logger.log('info', this.formatMessageData(message));
	}

	debug(message: string | Record<string, unknown>): void {
		this.logger.debug(this.formatMessageData(message));
	}
	verbose(message: unknown): void {
		this.logger.verbose(this.formatMessageData(message));
	}

	formatMessageData(message): string {
		return typeof message === 'string' ? message : JSON.stringify(message);
	}

	readErrorLog(pageNum, pageSize = 20, sort) {
		return this.lowDB.readRecentData('errorLogs', pageSize, pageNum, sort);
	}

	readErrorLogSize() {
		return this.lowDB.getDataSize('errorLogs');
	}
}

interface DBTransportOptions extends Transport.TransportStreamOptions {
	LowDBInstance: LowDbService;
}
// 自定义winston transport
class DBTransport extends Transport {
	private DBInstance: LowDbService;
	private options;
	constructor(opts: DBTransportOptions) {
		super(opts);
		this.options = opts;
		this.DBInstance = opts.LowDBInstance;
	}

	log({ level, message }, callback) {
		try {
			message = JSON.parse(message);
		} catch {}
		level === 'error' &&
			this.DBInstance.pushOne('errorLogs', {
				level,
				message: message,
				dateString: new Date().toLocaleString(),
				timestamp: new Date().getTime(),
				id: UUID.v1()
			});
		callback();
	}
}

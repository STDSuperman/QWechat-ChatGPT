import { Controller, Get, Query } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ESortType } from '@chat-common/utils/constants'
export interface IErrorLogItem {
	dateString: string;
	level: string;
	message: string;
	timestamp: number;
}

export interface IErrorLogResponseData {
	results: IErrorLogItem[];
	total: number;
}

export interface IErrorLogResponse {
	code: number;
	data: IErrorLogResponseData;
}

@Controller('log')
export class LoggerController {
	constructor(private loggerService: LoggerService) {}

	@Get('/error')
	async readErrorLog(
		@Query('pageNum') pageNum = 1,
		@Query('pageSize') pageSize = 20,
		@Query('sort') sort = ESortType.descending
	): Promise<IErrorLogResponse> {
		return {
			code: 0,
			data: {
				results: await this.loggerService.readErrorLog(
					pageNum,
					pageSize,
					sort
				),
				total: await this.loggerService.readErrorLogSize()
			}
		};
	}

	@Get('/others')
	readOtherLog(): string {
		return '';
	}
}

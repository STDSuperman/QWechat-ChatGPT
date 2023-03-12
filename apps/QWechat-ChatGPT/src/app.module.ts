import { Module } from '@nestjs/common';
import GlobalModule from './common/global/global.module'
import { PlatFormModule } from './platform/platform.module';

@Module({
  imports: [GlobalModule, PlatFormModule],
})
export class AppModule {}

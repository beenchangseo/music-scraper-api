import { Module } from '@nestjs/common';
import { MusicChartModule } from './music-chart/music-chart.module';
import { LowdbService } from './lowdb/lowdb.service';
import {ScheduleModule} from "@nestjs/schedule";
import { ScraperService } from './scraper/scraper.service';

@Module({
  imports: [
      ScheduleModule.forRoot(),
      MusicChartModule
  ],
  controllers: [],
  providers: [LowdbService, ScraperService],
})
export class AppModule {}

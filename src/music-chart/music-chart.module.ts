import { Module } from '@nestjs/common';
import { MusicChartService } from './music-chart.service';
import { MusicChartController } from './music-chart.controller';
import {LowdbService} from "../lowdb/lowdb.service";

@Module({
  controllers: [MusicChartController],
  providers: [MusicChartService, LowdbService]
})
export class MusicChartModule {}

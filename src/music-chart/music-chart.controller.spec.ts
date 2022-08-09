import { Test, TestingModule } from '@nestjs/testing';
import { MusicChartController } from './music-chart.controller';
import { MusicChartService } from './music-chart.service';

describe('MusicChartController', () => {
  let controller: MusicChartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicChartController],
      providers: [MusicChartService],
    }).compile();

    controller = module.get<MusicChartController>(MusicChartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

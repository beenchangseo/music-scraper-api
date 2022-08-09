import { Test, TestingModule } from '@nestjs/testing';
import { MusicChartService } from './music-chart.service';

describe('MusicChartService', () => {
  let service: MusicChartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MusicChartService],
    }).compile();

    service = module.get<MusicChartService>(MusicChartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

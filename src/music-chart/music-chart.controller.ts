import {Controller, Get, Param} from '@nestjs/common';
import {MusicChartService} from './music-chart.service';

type CollectionName = 'mellon'| 'gennie' | 'vibe';

interface MusicSummary {
  ranking: number;
  name: string;
  singer: string;
  album: string;
}

interface MusicDetail {
  publisher: string;
  agency: string;
}

interface Songs extends MusicDetail, MusicSummary {}


@Controller('music-chart')
export class MusicChartController {
  private readonly songCache = new Map<string, Songs>();
  private readonly summaryCache = new Map<string, MusicSummary[]>();
  private readonly songsCache = new Map<string, Songs[]>();

  constructor(private readonly musicChartService: MusicChartService) {}

  cacheClearHandler = setInterval(() => {
    this.songCache.clear();
    this.summaryCache.clear();
    this.songsCache.clear();
  }, 10000);

  @Get('/:vendor/song/:musicId')
  async getSongByMusicId(
      @Param('vendor') vendor: CollectionName,
      @Param('musicId') musicId: number,
  ){
    const cacheData = this.songCache.get(`${vendor}-ranking-${musicId}`)
    if(!cacheData){
      const queryData: Songs = await this.musicChartService.getSongByMusicId(vendor, musicId);
      this.songCache.set(`${vendor}-ranking-${musicId}`, queryData)
      return queryData;
    }else{
      return cacheData;
    }

  }

  @Get('/:vendor/summary')
  async getSummary(
      @Param('vendor') vendor: CollectionName,
  ): Promise<MusicSummary[]>{
    const cacheData: MusicSummary[]= this.summaryCache.get(`${vendor}-summary`);
    if(!cacheData){
      const queryData: MusicSummary[] = await this.musicChartService.getSummary(vendor);
      this.summaryCache.set(`${vendor}-summary`, queryData);
      return queryData
    }else{
      return cacheData
    }
  }

  @Get('/:vendor/songs')
  async getSongs(
      @Param('vendor') vendor: CollectionName,
  ): Promise<Songs[]>{
    const cacheData: Songs[] = this.songsCache.get(`${vendor}-songs`);
    if (!cacheData){
      const queryData: Songs[] = await this.musicChartService.getSongs(vendor);
      this.songsCache.set(`${vendor}-songs`, queryData);
      return queryData;
    }else{
      return cacheData;
    }
  }
}

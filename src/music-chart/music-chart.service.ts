import { Injectable } from '@nestjs/common';
import {LowdbService} from "../lowdb/lowdb.service";

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

@Injectable()
export class MusicChartService {
    constructor(
        private readonly lowdbService: LowdbService
    ) {
    }

    async getSongByMusicId(collectionName: CollectionName, ranking: number){
        return this.lowdbService.getSongByMusicId(collectionName, ranking);
    }

    async getSummary(collectionName: CollectionName): Promise<MusicSummary[]>{
        return await this.lowdbService.getSummary(collectionName);
    }

    async getSongs(collectionName: CollectionName): Promise<Songs[]>{
        return await this.lowdbService.getDetail(collectionName);
    }
}

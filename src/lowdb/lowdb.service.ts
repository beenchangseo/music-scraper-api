import {Injectable} from '@nestjs/common';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';

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
export class LowdbService {
    private db: lowdb.LowdbAsync<any>;


    constructor() {
        this.initDatabase('database');
    }

    private async initDatabase(database: string) {
        const adapter = new FileAsync(`db/${database}.json`);
        this.db = await lowdb(adapter);
    }

    async update(record: any, collectionName: CollectionName): Promise<void> {
        await this.db.set(collectionName, record).write();
    }

    async getSongByMusicId(collectionName: CollectionName, ranking: number){
        return await this.db.get(collectionName).get('MusicDetail').find({ranking: parseInt(String(ranking))}).value();
    }

    async getSummary(collectionName: CollectionName): Promise<any[]>{
        return await this.db.get(collectionName).get('MusicSummary').value();
    }

    async getDetail(collectionName: CollectionName): Promise<any[]>{
        return await this.db.get(collectionName).get('MusicDetail').sortBy('ranking').value();
    }
}

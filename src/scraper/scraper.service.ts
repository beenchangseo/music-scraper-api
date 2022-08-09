import {Injectable, Logger} from '@nestjs/common';
import {Interval, Timeout} from "@nestjs/schedule";
import * as cheerio from 'cheerio';
import axios from "axios";

import {LowdbService} from "../lowdb/lowdb.service";

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
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);

    constructor(
        private readonly lowdbService: LowdbService
    ) {
    }

    @Timeout(5000)
    initDatabase() {
        this.vibeChartScraperHandler();
        this.mellonChartScraperHandler();
        this.gennieChartScraperHandler()
    }

    @Interval(30 * 60 * 1000)
    async vibeChartScraperHandler() {
        this.logger.debug('[Vibe] 크롤링 시작');
        let musicList: MusicSummary[] = [];
        let musicDetailList: Songs[] = [];
        const response = await axios.get("https://apis.naver.com/vibeWeb/musicapiweb/vibe/v1/chart/track/total?start=1&display=100");
        if (response.status === 200) {
            const songs = response.data.response.result.chart.items.tracks;
            await Promise.all(songs.map(async (song) => {
                const music: MusicSummary = {
                    ranking: song.rank.currentRank,
                    name: song.trackTitle,
                    singer: song.artists[0].artistName,
                    album: song.album.albumTitle,
                }
                musicList.push(music);
                const response = await axios.get(`https://apis.naver.com/vibeWeb/musicapiweb/album/${song.album.albumId}`);
                if (response.status === 200) {
                    const album = response.data.response.result.album
                    const musicDetail: MusicDetail = {
                        publisher: album.productionName,
                        agency: album.agencyName,
                    }
                    musicDetailList.push({...music, ...musicDetail});
                }
            }));
            await this.lowdbService.update({
                'MusicSummary': musicList,
                'MusicDetail': musicDetailList
            }, 'vibe');
        } else {
            this.logger.debug('[Vibe] 순위정보 크롤링 실패');
        }
        this.logger.debug('[Vibe] 크롤링 종료');
    }

    @Interval(30 * 60 * 1000)
    async mellonChartScraperHandler() {
        this.logger.debug('[Mellon] 크롤링 시작');
        let musicList: MusicSummary[] = [];
        let musicDetailList: Songs[] = [];
        let albumIdList = []
        const response = await axios.get(`https://www.melon.com/chart/index.htm`);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            $('.d_song_list .lst50, .lst100').each((index, item) => {
                const music: MusicSummary = {
                    ranking: parseInt($(item).find('.rank').text()),
                    name: $(item).find('.wrap_song_info .rank01 > span > a').text(),
                    singer: $(item).find('.wrap_song_info .rank02 > a').text(),
                    album: $(item).find('.wrap_song_info .rank03 > a').text(),
                }
                musicList.push(music);
                albumIdList.push(($(item).find('.wrap_song_info .rank03 > a').attr('href')).split("'")[1])
            });
            await Promise.all(albumIdList.map(async (albumId, index) => {
                const response = await axios.get(`https://www.melon.com/album/detail.htm?albumId=${albumId}`);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
                    const dd = $('.wrap_info .entry .meta .list > dd').toArray()
                    const musicDetail: MusicDetail = {
                        publisher: $(dd[2]).text(),
                        agency: $(dd[3]).text(),
                    }
                    musicDetailList.push({...musicList[index], ...musicDetail})
                }
            }));
        }else{
            //Fail
            this.logger.debug('[Mellon] 크롤링 실패');
        }
        await this.lowdbService.update({
            'MusicSummary': musicList,
            'MusicDetail': musicDetailList
        }, 'mellon');
        this.logger.debug('[Mellon] 크롤링 종료');
    }

    @Interval(30 * 60 * 1000)
    async gennieChartScraperHandler(){
        this.logger.debug('[Gennie] 크롤링 시작');
        let musicList: MusicSummary[] = [];
        let musicDetailList: Songs[] = [];
        let albumIdList = []
        const response = await axios.get(`https://www.genie.co.kr/chart/top200`);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            $('.newest-list .music-list-wrap .list-wrap > tbody > tr.list ').each((index, item)=>{
                const music: MusicSummary = {
                    ranking: parseInt($(item).find('.number').text()),
                    name: $(item).find('.info .title').text().replace(/[\n, \t]/g, ''),
                    singer: $(item).find('.info .artist').text().replace(/[\n, \t]/g, ''),
                    album: $(item).find('.info .albumtitle').text().replace(/[\n, \t]/g, ''),
                }
                musicList.push(music);
                albumIdList.push(($(item).find('.info .albumtitle').attr('onclick')).split("'")[1])
            });
            await Promise.all(albumIdList.map(async (albumId, index) => {
                const response = await axios.get(`https://www.genie.co.kr/detail/albumInfo?axnm=${albumId}`);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
                    const details = $('.info-data > li').toArray()
                    const musicDetail: MusicDetail = {
                        publisher: $(details[2]).find('.value').text(),
                        agency: $(details[3]).find('.value').text(),
                    }
                    musicDetailList.push({...musicList[index], ...musicDetail})
                }
            }))
        }else{
            //Fail
            this.logger.debug('[Gennie] 크롤링 실패');
        }
        await this.lowdbService.update({
            'MusicSummary': musicList,
            'MusicDetail': musicDetailList
        }, 'gennie');
        this.logger.debug('[Gennie] 크롤링 종료');
    }
}

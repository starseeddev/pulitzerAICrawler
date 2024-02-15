// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ChosunService } from './scrapings/chosun.service';
import { JoongangService } from './scrapings/joongang.service';
import { DongaService } from './scrapings/donga.service';
import { HaniService } from './scrapings/hani.service';
import { MKService } from './scrapings/mK.service';
import { HankyungService } from './scrapings/hankyung.service';
import { SedailyService } from './scrapings/sedaily.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chosunScrapingService: ChosunService,
    private readonly joongangScrapingService: JoongangService,
    private readonly dongaScrapingService: DongaService,
    private readonly haniScrapingService: HaniService,
    private readonly mkScrapingService: MKService,
    private readonly hankyungScrapingService: HankyungService,
    private readonly sedailyScrapingService: SedailyService,
  ) {}

  @Get('/test')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/scrape/chosun') // 1. API 주소 변경
  async scrapeChosunNational() {
    await this.chosunScrapingService.crawlChosun();
    return '조선일보 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/joongang') // 2. 중앙일보 크롤링을 위한 엔드포인트 추가
  async scrapeJoongangNational() {
    await this.joongangScrapingService.crawlJoongang();
    return '중앙일보 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/donga') // 2. 동아일보 크롤링을 위한 엔드포인트 추가
  async scrapeDongaNational() {
    await this.dongaScrapingService.crawlDonga();
    return '동아일보 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/hani') // 2. 한겨레 크롤링을 위한 엔드포인트 추가
  async scrapeHaniNational() {
    await this.haniScrapingService.crawlHani();
    return '한겨레 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/mk') // 2. 한겨레 크롤링을 위한 엔드포인트 추가
  async scrapeMKNational() {
    await this.mkScrapingService.crawlMK();
    return '매일경제 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/hankyung') // 2. 한겨레 크롤링을 위한 엔드포인트 추가
  async scrapeHankyungNational() {
    await this.hankyungScrapingService.crawlHankyung();
    return '한국경제 스크래핑이 완료되었습니다.';
  }

  @Get('/scrape/sedaily') // 2. 한겨레 크롤링을 위한 엔드포인트 추가
  async scrapeSedaily() {
    await this.sedailyScrapingService.crawlSedaily();
    return '서울경제 스크래핑이 완료되었습니다.';
  }
}

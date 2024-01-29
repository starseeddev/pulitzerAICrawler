// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ChosunService } from './scrapings/chosun.service';
import { JoongangService } from './scrapings/joongang.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chosunScrapingService: ChosunService,
    private readonly joongangScrapingService: JoongangService,
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
}

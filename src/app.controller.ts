// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ChosunService } from './scrapings/chosun.service';
import { JoongangService } from './scrapings/joongang.service';
import { DongaService } from './scrapings/donga.service';
import { HaniService } from './scrapings/hani.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chosunScrapingService: ChosunService,
    private readonly joongangScrapingService: JoongangService,
    private readonly dongaScrapingService: DongaService,
    private readonly haniScrapingService: HaniService,
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
    return '동아일보 스크래핑이 완료되었습니다.';
  }
}

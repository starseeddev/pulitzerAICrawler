// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapingService } from './scrapings/scraping.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get('/test')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/scrape')
  async scrapeChosunNational() {
    await this.scrapingService.crawlChosunNational();
    return '스크래핑이 완료되었습니다.';
  }
}

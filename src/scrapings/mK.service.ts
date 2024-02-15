import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class MKService {
  private static readonly categories = [
    'economy',
    'business',
    'society',
    'world',
    'politics',
    'it',
    'culture',
    'sports',
  ];

  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  private mapCategoryToKorean(category: string): string {
    switch (category) {
      case 'economy':
        return '경제';
      case 'business':
        return '경제';
      case 'society':
        return '사회';
      case 'world':
        return '국제';
      case 'politics':
        return '정치';
      case 'it':
        return '테크';
      case 'culture':
        return '문화';
      case 'sports':
        return '스포츠';
      default:
        return category;
    }
  }

  async crawlMKArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval(
        '.news_ttl_sec .news_ttl_wrap .news_ttl',
        (element) => element.textContent.trim(),
      );
      console.log(`Title: ${title}`);

      const authorName = await page.$eval(
        '.news_write_info_group .author .name',
        (element) => element.textContent.trim(),
      );

      const authorEmail = await page.$eval(
        '.news_write_info_group .author .email',
        (element) => element.textContent.trim(),
      );

      // Extract article body (assuming it's in a specific class)
      const articleBody = await page.$eval(
        '.sec_body .news_cnt_detail_wrap',
        (element) => element.textContent.trim(),
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '매일경제';

      // Extract and parse the date
      const dateText = await page.$eval(
        '.time_area .registration dd',
        (element) => element.textContent,
      );
      const createdAt = this.parseDate(dateText);

      // Update or create the reporter in the database
      const reporter = await this.reportersService.createReporter(
        authorEmail,
        authorName,
        categories.length > 0 ? categories : defaultCategories,
        defaultMedia,
      );

      // Update or create the article in the database
      await this.articlesService.createArticle(
        reporter.email,
        title,
        articleBody,
        link,
        [],
        createdAt,
      );

      await browser.close();
    } catch (error) {
      console.error(`에러: ${error}`);
    }
  }

  private parseDate(dateText: string): Date | null {
    const match = dateText.match(/\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}/);
    if (match) {
      const dateString = match[0].replace(/\./g, '/'); // '.'을 '/'로 변경하여 Date 생성
      return new Date(dateString);
    }
    return null;
  }

  async crawlMK() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of MKService.categories) {
        const url = `https://www.mk.co.kr/news/${category}/`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$(
          '.latest_news_sec .sec_body .latest_news_wrap #list_area .news_node a',
        );

        console.log('articlesarticlesarticlesarticles', articles);

        for (let i = 0; i < Math.min(10, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlMKArticle(link, [this.mapCategoryToKorean(category)]);
        }
      }
    } catch (error) {
      console.error(`에러: ${error}`);
    } finally {
      await browser.close();
    }
  }
}

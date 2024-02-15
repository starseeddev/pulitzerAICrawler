import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class SedailyService {
  private static readonly categories = ['GA', 'GB', 'GC', 'GE', 'GK', 'GF'];

  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  private mapCategoryToKorean(category: string): string {
    switch (category) {
      case 'GA':
        return '경제';
      case 'GB':
        return '경제';
      case 'GC':
        return '경제';
      case 'GK':
        return '사회';
      case 'GF':
        return '국제';
      case 'GE':
        return '정치';
      default:
        return category;
    }
  }

  async crawlSedailyArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval('h1.art_tit', (element) =>
        element.textContent.trim(),
      );
      console.log(`Title: ${title}`);

      const authorName = await page.$eval(
        '.reporter_header .name a',
        (element) => element.textContent.trim(),
      );

      const authorEmail = await page.$eval(
        '.reporter_header .mail a',
        (element) => element.textContent.trim(),
      );

      // Extract article body (assuming it's in a specific class)
      const articleBody = await page.$eval('.article_view', (element) =>
        element.textContent.trim(),
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '서울경제';

      // Extract and parse the date
      const dateText = await page.$eval(
        '.article_info .url_txt',
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

  async crawlSedaily() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of SedailyService.categories) {
        const url = `https://www.sedaily.com/v/NewsMain/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$('.sub_main .sub_news_list .thumb a');

        console.log('articlesarticlesarticlesarticles', articles);

        for (let i = 0; i < Math.min(10, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlSedailyArticle(link, [
            this.mapCategoryToKorean(category),
          ]);
        }
      }
    } catch (error) {
      console.error(`에러: ${error}`);
    } finally {
      await browser.close();
    }
  }
}

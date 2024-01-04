import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class ScrapingService {
  private static readonly categories = [
    'economy',
    'politics',
    'trend',
    'national',
    'international',
    'medical',
    'investment',
    'sports',
    'culture-style',
  ];

  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  private mapCategoryToKorean(category: string): string {
    switch (category) {
      case 'economy':
        return '경제';
      case 'politics':
        return '정치';
      case 'trend':
        return '트렌드';
      case 'national':
        return '사회';
      case 'international':
        return '국제';
      case 'medical':
        return '건강';
      case 'investment':
        return '투자';
      case 'sports':
        return '스포츠';
      case 'culture-style':
        return '문화';
      default:
        return category;
    }
  }

  async crawlChosunArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval('h1', (element) => element.textContent);
      console.log(`Title: ${title}`);

      const authorEmail = await this.extractAuthorEmail(page);
      console.log(`Author Email: ${authorEmail}`);

      const authorName = await page.$eval(
        '.author-card--content-header .byline',
        (element) => element.textContent.trim(),
      );
      console.log(`Author Name: ${authorName}`);

      // Extract article body (assuming it's in a specific class)
      const articleBody = await page.$eval(
        '.article-body',
        (element) => element.textContent,
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '조선일보';

      // Extract and parse the date
      const dateText = await page.$eval(
        '.inputDate',
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
        createdAt,
      );

      await browser.close();
    } catch (error) {
      console.error(`에러: ${error}`);
    }
  }

  private async extractAuthorEmail(page: puppeteer.Page): Promise<string> {
    const authorEmailWithQuery = await page.$eval(
      '.author-card--content-header a[href^="mailto:"]',
      (element) => {
        const emailLink = element.getAttribute('href');
        return emailLink ? decodeURIComponent(emailLink.substr(7)) : '';
      },
    );

    // Remove query parameters (?body=...) from the email address
    return authorEmailWithQuery.split('?')[0];
  }

  private parseDate(dateText: string): Date | null {
    const match = dateText.match(/\d{4}\.\d{2}\.\d{2}\. \d{2}:\d{2}/);
    if (match) {
      return new Date(match[0].replace(/\./g, '/')); // Convert the date string to a valid Date object
    }
    return null;
  }

  async crawlChosunNational() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of ScrapingService.categories) {
        const url = `https://www.chosun.com/${category}/`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$(
          'div.story-card-wrapper a.story-card__headline',
        );

        for (let i = 0; i < Math.min(15, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlChosunArticle(link, [
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

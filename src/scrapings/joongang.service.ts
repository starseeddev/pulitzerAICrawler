import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class JoongangService {
  private static readonly categories = [
    'money',
    'politics',
    'society',
    'lifestyle',
    'world',
    'sports',
    'culture',
  ];

  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  private mapCategoryToKorean(category: string): string {
    switch (category) {
      case 'money':
        return '경제';
      case 'politics':
        return '정치';
      case 'society':
        return '사회';
      case 'world':
        return '국제';
      case 'lifestyle':
        return '문화';
      case 'sports':
        return '스포츠';
      case 'culture':
        return '문화';
      default:
        return category;
    }
  }

  async crawlJoongangArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval('h1.headline', (element) =>
        element.textContent.trim(),
      );
      console.log(`Title: ${title}`);

      const { authorName, authorEmail } = await this.extractAuthorEmail(
        await page.$eval('div.ab_byline', (element) =>
          element.textContent.trim(),
        ),
      );

      // Extract article body (assuming it's in a specific class)
      const articleBody = await page.$eval('.article_body', (element) =>
        element.textContent.trim(),
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '중앙일보';

      // Extract and parse the date
      const dateText = await page.$eval(
        'p.date time',
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

  private async extractAuthorEmail(bylineText: string) {
    // 정규식을 사용하여 기자 이름과 유형을 추출
    const match = bylineText.match(/^(.*?) (기자|특파원)/);
    const name = match ? `${match[1].trim()} ${match[2]}` : '';

    // 이메일 부분을 추출
    const emailMatch = bylineText.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/,
    );
    const email = emailMatch ? emailMatch[1] : '';

    return { authorName: name, authorEmail: email };
  }

  private parseDate(dateText: string): Date | null {
    const match = dateText.match(/\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}/);
    if (match) {
      const dateString = match[0].replace(/\./g, '/'); // '.'을 '/'로 변경하여 Date 생성
      return new Date(dateString);
    }
    return null;
  }

  async crawlJoongang() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of JoongangService.categories) {
        const url = `https://www.joongang.co.kr/${category}/`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$(
          '.contents_bottom .story_list .headline a',
        );

        for (let i = 10; i < Math.min(20, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlJoongangArticle(link, [
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

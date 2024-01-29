import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class DongaService {
  private static readonly categories = [
    'Politics',
    'Economy',
    'Inter',
    'Society',
    'Culture',
    'Sports',
    'Health',
  ];

  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  private mapCategoryToKorean(category: string): string {
    switch (category) {
      case 'Economy':
        return '경제';
      case 'Politics':
        return '정치';
      case 'Inter':
        return '국제';
      case 'Society':
        return '사회';
      case 'culture':
        return '문화';
      case 'Sports':
        return '스포츠';
      case 'Health':
        return '건강';
      default:
        return category;
    }
  }

  async crawlDongaArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval('.article_title .title', (element) =>
        element.textContent.trim(),
      );
      console.log(`Title: ${title}`);

      const { authorName, authorEmail } = await this.extractAuthorEmail(
        await page.$eval('.report a', (element) => element),
      );

      // Extract article body (assuming it's in a specific class)
      const articleBody = await page.$eval('#article_txt', (element) =>
        element.textContent.trim(),
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '동아일보';

      // Extract and parse the date
      const dateText = await page.$eval(
        '.title_foot .date01',
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

  private async extractAuthorEmail(anchorTagElement: Element) {
    // <a> 태그 요소를 선택합니다.
    const aTag = anchorTagElement as HTMLAnchorElement;

    if (aTag) {
      // href 속성에서 이메일을 추출합니다.
      const email = aTag.getAttribute('href').split(':')[1];

      // <span> 태그에서 기자 이름을 추출합니다.
      const name = aTag.querySelector('.name')?.textContent?.trim() || '';

      return { authorName: name, authorEmail: email };
    }

    return { authorName: '', authorEmail: '' }; // <a> 태그가 없는 경우 빈 문자열 반환
  }

  private parseDate(dateText: string): Date | null {
    const match = dateText.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/);
    if (match) {
      const dateString = match[0]; // 날짜 형식이 YYYY-MM-DD HH:mm
      return new Date(dateString);
    }
    return null;
  }

  async crawlDonga() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of DongaService.categories) {
        const url = `https://www.donga.com/news/${category}/List`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$('#content .articleList .tit a');

        for (let i = 10; i < Math.min(20, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlDongaArticle(link, [
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

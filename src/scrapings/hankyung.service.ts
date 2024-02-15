import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class HankyungService {
  private static readonly categories = [
    'economy',
    'politics',
    'society',
    'international',
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
      case 'international':
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

  async crawlHankyungArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      page.setDefaultNavigationTimeout(0);
      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval(
        '.article-contents h1.headline',
        (element) => element.textContent.trim(),
      );
      console.log(`Title: ${title}`);

      // Extract author information from the article body
      const authorText = await page.$eval('.article-body', (element) => {
        // Get the text content of the article body
        const textContent = element.textContent.trim();
        // Find the index where '기자' appears last
        const lastIndex = textContent.lastIndexOf('기자');
        // Extract the text from the last occurrence of '기자' to the end
        return textContent.substring(lastIndex);
      });

      // Split the author information by '기자'
      const parts = authorText.split('기자');
      // The last part may contain the author name and email
      const lastPart = parts[parts.length - 1].trim();

      // Extract the name and email
      const nameEndIndex = lastPart.length - 3; // Assuming name has at least three characters
      const authorName = lastPart.substring(0, nameEndIndex).trim();
      const authorEmail = lastPart.substring(nameEndIndex).trim();

      console.log(`Author Name: ${authorName}`);
      console.log(`Author Email: ${authorEmail}`);

      console.log(`Author Name: ${authorName}`);
      console.log(`Author Email: ${authorEmail}`);

      // Extract article body
      const articleBody = await page.$eval('#articletxt', (element) =>
        element.textContent.trim(),
      );
      console.log(`Article Body: ${articleBody}`);

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '한국경제';

      // Extract and parse the date
      const dateText = await page.$eval(
        '.article-timestamp .txt-date',
        (element) => element.textContent,
      );
      const createdAt = this.parseDate(dateText);

      // If authorName or authorEmail is empty, do not save to the database
      if (authorName && authorEmail) {
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
      } else {
        console.log(
          'Author name or email is empty. Article not saved to the database.',
        );
      }

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

  async crawlHankyung() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);
    try {
      for (const category of HankyungService.categories) {
        const url = `https://www.hankyung.com/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$(
          '.section-news-wrap .news-list .news-tit a',
        );

        console.log('articlesarticlesarticlesarticles', articles);

        for (let i = 0; i < Math.min(10, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlHankyungArticle(link, [
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

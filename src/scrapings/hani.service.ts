import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class HaniService {
  private static readonly categories = [
    'politics',
    'society',
    'economy',
    'international',
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
      case 'politics':
        return '정치';
      case 'society':
        return '사회';
      case 'international':
        return '국제';
      case 'sports':
        return '스포츠';
      case 'culture':
        return '문화';
      default:
        return category;
    }
  }

  async crawlHaniArticle(link: string, categories: string[]) {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      await page.goto(link, { waitUntil: 'domcontentloaded' });

      // Extract the title
      const title = await page.$eval(
        'article h3',
        (element) => element.textContent,
      );
      console.log(`Title: ${title}`);

      // Extract author name and email from the last paragraph
      // const lastParagraph = await page.$('.article-text .text:last-child');
      // const authorInfo = await lastParagraph.$eval('a', (element) => {
      //   return {
      //     authorName: element.textContent.trim().split(' 기자')[0],
      //     authorEmail: element.getAttribute('href').replace('mailto:', ''),
      //   };
      // });
      //
      // const { authorName, authorEmail } = authorInfo;

      const lastParagraph = await page.$('.article-text .text:last-child');
      const authorText = await lastParagraph.evaluate((element) =>
        element.textContent.trim(),
      );

      // Regular expression to match an email pattern
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

      // Extracting author email
      const authorEmailMatch = authorText.match(emailPattern);
      const authorEmail = authorEmailMatch ? authorEmailMatch[0] : '';

      // Extracting author name
      const authorName = authorEmail
        ? authorText.split(authorEmail)[0].trim()
        : authorText;

      const articleBodyElements = await page.$$('.article-text .text');
      let articleBody = '';
      for (const element of articleBodyElements) {
        articleBody += await (
          await element.getProperty('textContent')
        ).jsonValue();
      }

      // Ensure categories and media have default values
      const defaultCategories: string[] = [];
      const defaultMedia: string = '한겨레';

      // Extract and parse the date
      const dateText = await page.$eval(
        'article div ul li span',
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
    const match = dateText.match(/\d{4}\.\d{2}\.\d{2}\. \d{2}:\d{2}/);
    if (match) {
      return new Date(match[0].replace(/\./g, '/')); // Convert the date string to a valid Date object
    }
    return null;
  }

  async crawlHani() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
      for (const category of HaniService.categories) {
        const url = `https://www.hani.co.kr/arti/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$('ul li article a');

        for (let i = 0; i < Math.min(10, articles.length); i++) {
          const article = articles[i];
          const link = await page.evaluate((el) => el.href, article);
          console.log(`Link: ${link}`);
          await this.crawlHaniArticle(link, [
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

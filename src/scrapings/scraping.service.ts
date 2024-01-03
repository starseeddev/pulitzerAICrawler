import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ReportersService } from '../reporters/reporters.service';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class ScrapingService {
  constructor(
    private readonly reportersService: ReportersService,
    private readonly articlesService: ArticlesService,
  ) {}

  async crawlChosunArticle(link: string) {
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

      // Update or create the reporter in the database
      const reporter = await this.reportersService.createReporter(
        authorEmail,
        authorName,
      );

      // Update or create the article in the database
      await this.articlesService.createArticle(
        reporter.email,
        title,
        articleBody,
        link,
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

  async crawlChosunNational() {
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();

      const url = 'https://www.chosun.com/economy/';
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const articles = await page.$$(
        'div.story-card-wrapper a.story-card__headline',
      );

      for (const article of articles) {
        const link = await page.evaluate((el) => el.href, article);
        console.log(`Link: ${link}`);
        await this.crawlChosunArticle(link);
      }

      await browser.close();
    } catch (error) {
      console.error(`에러: ${error}`);
    }
  }
}

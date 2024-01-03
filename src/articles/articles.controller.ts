import { Controller, Post, Body } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  async createArticle(
    @Body()
    body: {
      reporterEmail: string;
      title: string;
      content: string;
      link: string;
    },
  ) {
    return await this.articlesService.createArticle(
      body.reporterEmail,
      body.title,
      body.content,
      body.link,
    );
  }
}

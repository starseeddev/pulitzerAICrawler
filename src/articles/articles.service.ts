import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportersService } from '../reporters/reporters.service';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    private readonly reportersService: ReportersService,
  ) {}

  async createArticle(
    reporterEmail: string,
    title: string,
    content: string,
    link: string,
    createdAt: Date | null, // Add createdAt parameter
  ): Promise<Article | undefined> {
    const reporter =
      await this.reportersService.getReporterByEmail(reporterEmail);

    if (!reporter) {
      // Handle the case where the reporter does not exist.
      console.error('Reporter not found for email:', reporterEmail);
      return undefined;
    }

    const article = this.articlesRepository.create({
      title,
      content,
      reporter,
      link,
      createdAt: createdAt || new Date(), // Use the provided date or the current date
    });
    return await this.articlesRepository.save(article);
  }
}

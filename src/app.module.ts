import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test.module';
import { ScrapingService } from './scrapings/scraping.service';
import { Article } from './entities/article.entity';
import { Reporter } from './entities/reporter.entity';
import { ReportersService } from './reporters/reporters.service';
import { ArticlesService } from './articles/articles.service';

@Module({
  imports: [
    TestModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'pulitzer-crawler.ctg2ok06s7t6.ap-northeast-2.rds.amazonaws.com',
      port: 5432,
      username: 'pulitzerCrawler',
      password: 'qwer1234',
      database: 'crawlerdb',
      entities: [Reporter, Article], // Add your entities here
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    TypeOrmModule.forFeature([Reporter, Article]),
  ],
  controllers: [AppController],
  providers: [AppService, ScrapingService, ArticlesService, ReportersService],
})
export class AppModule {}

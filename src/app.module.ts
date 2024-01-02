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
      host:
        process.env.DB_HOST ||
        'pulitzer-ai.c7uosqgw0pku.ap-northeast-2.rds.amazonaws.com',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'pulitzerai',
      password: process.env.DB_PASSWORD || 'qwer1234',
      database: process.env.DB_DATABASE || 'pulitzeraidb',
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestModule } from './test.module';
import { ChosunService } from './scrapings/chosun.service';
import { JoongangService } from './scrapings/joongang.service';
import { Article } from './entities/article.entity';
import { Reporter } from './entities/reporter.entity';
import { ReportersService } from './reporters/reporters.service';
import { ArticlesService } from './articles/articles.service';
import { DongaService } from './scrapings/donga.service';

@Module({
  imports: [
    TestModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:
        process.env.DB_HOST ||
        'pulitzercrawlinginstance.ctg2ok06s7t6.ap-northeast-2.rds.amazonaws.com',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'pulitzerCrawling',
      password: process.env.DB_PASSWORD || 'qwer1234',
      database: process.env.DB_DATABASE || 'pulitzerCrawlingDB',
      entities: [Reporter, Article], // Add your entities here
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    TypeOrmModule.forFeature([Reporter, Article]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ChosunService,
    JoongangService,
    DongaService,
    ArticlesService,
    ReportersService,
  ],
})
export class AppModule {}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Reporter } from '../entities/reporter.entity';

@Injectable()
export class ReportersService {
  constructor(
    @InjectRepository(Reporter)
    private readonly reportersRepository: Repository<Reporter>,
  ) {}

  async createReporter(
    email: string,
    name: string,
    categories: string[],
    media: string,
  ): Promise<Reporter> {
    const existingReporter = await this.reportersRepository.findOne({
      where: { email },
    });

    if (existingReporter) {
      // Already existing reporter, update the categories and media
      existingReporter.categories = [
        ...new Set([...existingReporter.categories, ...categories]),
      ];
      existingReporter.media = media;
      return await this.reportersRepository.save(existingReporter);
    }

    const reporter = this.reportersRepository.create({
      email,
      name,
      categories,
      media,
    });
    return await this.reportersRepository.save(reporter);
  }

  async getReporterByEmail(email: string): Promise<Reporter | undefined> {
    return await this.reportersRepository.findOne({
      where: { email },
    });
  }
}

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

  async createReporter(email: string, name: string): Promise<Reporter> {
    const existingReporter = await this.reportersRepository.findOne({
      where: { email },
    });

    if (existingReporter) {
      // 이미 존재하는 기자인 경우, 그냥 반환
      return existingReporter;
    }

    const reporter = this.reportersRepository.create({ email, name });
    return await this.reportersRepository.save(reporter);
  }

  async getReporterByEmail(email: string): Promise<Reporter | undefined> {
    return await this.reportersRepository.findOne({
      where: { email },
    });
  }
}

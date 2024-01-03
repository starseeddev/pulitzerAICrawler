import { Controller, Post, Body } from '@nestjs/common';
import { ReportersService } from './reporters.service';

@Controller('reporters')
export class ReportersController {
  constructor(private readonly reportersService: ReportersService) {}

  @Post()
  async createReporter(
    @Body()
    body: {
      email: string;
      name: string;
      categories: string[]; // Change to an array of categories
      media: string;
    },
  ) {
    return await this.reportersService.createReporter(
      body.email,
      body.name,
      body.categories || [], // Provide a default value for categories
      body.media, // Provide a default value for media
    );
  }
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reporter } from './reporter.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => Reporter, (reporter) => reporter.articles)
  reporter: Reporter;
}

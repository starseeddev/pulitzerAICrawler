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

  @Column({ unique: true }) // Unique 제약 조건 추가
  link: string;

  @ManyToOne(() => Reporter, (reporter) => reporter.articles)
  reporter: Reporter;
}

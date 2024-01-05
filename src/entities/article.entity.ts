import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
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

  @Column('simple-array')
  keywords: string[];

  @CreateDateColumn() // 생성 시간을 저장하는 컬럼
  createdAt: Date;

  @ManyToOne(() => Reporter, (reporter) => reporter.articles)
  reporter: Reporter;
}

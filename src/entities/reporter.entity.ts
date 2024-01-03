import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class Reporter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column('simple-array')
  categories: string[];

  @Column() // Remove the default value
  media: string;

  @OneToMany(() => Article, (article) => article.reporter)
  articles: Article[];
}

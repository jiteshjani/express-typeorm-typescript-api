import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MinLength } from 'class-validator';
import { User } from './User';

@Entity('stores')
export class Store extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @MinLength(10, { message: 'store name must be at least 10 character long' })
  name: string;

  @ManyToOne(() => User, (user) => user.stores)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

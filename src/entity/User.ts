import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import argon2 from 'argon2';
import { IsEmail, Length, ValidateIf } from 'class-validator';
import { Store } from './Store';

@Entity('users')
export class User extends BaseEntity {
  private tempPassword: string;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Length(3, 30, {
    message: 'username must be between 3 to 30 characters long',
  })
  username: string;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ select: false, nullable: false })
  @ValidateIf((Obj) => Obj.password !== Obj.tempPassword)
  @Length(6, 16, {
    message: 'password must be between 6 to 16 characters long',
  })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Store, (store) => store.user)
  stores: Store[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  @AfterLoad()
  private setTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private async encryptPassword(): Promise<void> {
    if (this.tempPassword !== this.password) {
      this.password = await argon2.hash(this.password);
    }
  }
}

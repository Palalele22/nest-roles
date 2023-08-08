import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserRole } from './enums';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

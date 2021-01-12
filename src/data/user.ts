import { Property, Required } from '@tsed/schema';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Property()
  id: number;

  @Column()
  @Required()
  username: string;

  @Column()
  @Required()
  password: string;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique
} from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../organizations/organization.entity';

@Unique(['name', 'organization'])
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: true })
  is_active!: boolean;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @CreateDateColumn()
  created_at!: Date;
}

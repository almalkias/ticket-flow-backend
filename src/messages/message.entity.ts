import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ticket } from '../tickets/ticket.entity';

export enum SenderType {
  CUSTOMER = 'customer',
  AGENT = 'agent',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column('text')
  body: string;

  @Column({ default: false })
  is_internal: boolean;

  @Column({ type: 'enum', enum: SenderType })
  sender_type: SenderType;

  @Column({ nullable: true })
  sender_user_id: number;

  @Column()
  sender_name: string;

  @CreateDateColumn()
  created_at: Date;
}

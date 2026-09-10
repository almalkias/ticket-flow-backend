import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Category } from './categories/category.entity';
import { Ticket } from './tickets/ticket.entity';
import { Message } from './messages/message.entity';
import { Notification } from './notifications/notification.entity';
import { Organization } from './organizations/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const url = config.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          entities: [User, Category, Ticket, Message, Notification, Organization],
          synchronize: false,
        };
        if (url) {
          return { ...base, url, ssl: { rejectUnauthorized: false } };
        }
        return {
          ...base,
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        };
      },
    }),
  ],
})
export class DatabaseModule {}

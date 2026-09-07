import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;

const isCompiled = __filename.endsWith('.js');

const base: Partial<DataSourceOptions> = {
  type: 'postgres',
  entities: isCompiled ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isCompiled ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
};

const connectionOptions = url
  ? { url, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

export default new DataSource({
  ...base,
  ...connectionOptions,
} as DataSourceOptions);

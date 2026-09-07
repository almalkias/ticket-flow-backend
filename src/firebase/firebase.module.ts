import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
          ? JSON.parse(
              Buffer.from(
                process.env.FIREBASE_SERVICE_ACCOUNT,
                'base64',
              ).toString('utf8'),
            )
          : require('../../firebase-service-account.json');

        return admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN', TypeOrmModule],
})
export class FirebaseModule {}

import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-service-account.json';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        return admin.initializeApp({
          credential: admin.credential.cert({
            ...serviceAccount,
          } as admin.ServiceAccount),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN', TypeOrmModule],
})
export class FirebaseModule {}

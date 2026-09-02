import { DataSource } from 'typeorm';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../users/user.entity';

dotenv.config({ path: `${__dirname}/../../.env` });

const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert({ ...serviceAccount }),
});

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
});

async function seedAdmin() {
  await dataSource.initialize();

  const email = 'admin@ticketflow.com';
  const fullName = 'Super Admin';

  const existing = await dataSource
    .getRepository(User)
    .findOne({ where: { email } });
  if (existing) {
    console.log('Admin already exists');
    await dataSource.destroy();
    return;
  }

  try {
    await admin.auth().getUserByEmail(email);
    console.log(
      'User already exists in Firebase but not in database — please check manually',
    );
    await dataSource.destroy();
    return;
  } catch {
    // user does not exist in Firebase, proceed
  }

  const firebaseUser = await admin
    .auth()
    .createUser({ email, emailVerified: true });
  await admin.auth().generatePasswordResetLink(email);

  const user = dataSource.getRepository(User).create({
    firebase_uid: firebaseUser.uid,
    email,
    full_name: fullName,
    role: UserRole.ADMIN,
  });

  await dataSource.getRepository(User).save(user);
  console.log('Admin created successfully');
  await dataSource.destroy();
}

seedAdmin();

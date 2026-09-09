import { DataSource } from 'typeorm';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../users/user.entity';

dotenv.config({ path: `${__dirname}/../../.env` });

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'))
  : require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const url = process.env.DATABASE_URL;

const dataSource = new DataSource({
  type: 'postgres',
  ...(url
    ? { url, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
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

async function setAdminPassword() {
  const email = 'admin@ticketflow.com';
  const password = process.env.ADMIN_PASSWORD || '';

  if (!password) {
    console.error('Error: ADMIN_PASSWORD env var is required');
    console.error('Usage: ADMIN_PASSWORD=yourpassword npm run seed:admin:prod -- --set-password');
    process.exit(1);
  }

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().updateUser(user.uid, { password });
  console.log(`Password set successfully for ${email}`);
}

const isSetPassword = process.argv.includes('--set-password');
isSetPassword ? setAdminPassword() : seedAdmin();

import * as dotenv from 'dotenv';
dotenv.config();

import * as admin from 'firebase-admin';
import AppDataSource from './data-source';

const DEMO_EMAIL = 'demo@ticketflow.app';
const DEMO_PASSWORD = 'demo1234';
const DEMO_ORG_NAME = 'Demo Company';

function initFirebase() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString(
          'utf8',
        ),
      )
    : require('../../firebase-service-account.json');

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function getOrCreateFirebaseUser(): Promise<string> {
  try {
    const existing = await admin.auth().getUserByEmail(DEMO_EMAIL);
    console.log('Demo Firebase user exists:', existing.uid);
    return existing.uid;
  } catch {
    const created = await admin.auth().createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: 'Demo Admin',
    });
    console.log('Created demo Firebase user:', created.uid);
    return created.uid;
  }
}

async function seed() {
  initFirebase();
  await AppDataSource.initialize();
  const q = AppDataSource.createQueryRunner();
  await q.connect();
  await q.startTransaction();

  try {
    const firebaseUid = await getOrCreateFirebaseUser();

    // ── Create org + admin ONCE (stable across resets) ──────────────────────
    let [org] = await q.query(
      `SELECT id, uuid FROM organizations WHERE name = $1`,
      [DEMO_ORG_NAME],
    );
    if (!org) {
      [org] = await q.query(
        `INSERT INTO organizations (name, uuid, created_at)
         VALUES ($1, gen_random_uuid(), NOW()) RETURNING id, uuid`,
        [DEMO_ORG_NAME],
      );
      console.log('Created demo org id:', org.id);
    } else {
      console.log('Demo org exists id:', org.id);
    }

    let [adminUser] = await q.query(
      `SELECT id FROM users WHERE firebase_uid = $1`,
      [firebaseUid],
    );
    if (!adminUser) {
      [adminUser] = await q.query(
        `INSERT INTO users (firebase_uid, email, full_name, role, is_active, organization_id, created_at, updated_at)
         VALUES ($1, $2, 'Demo Admin', 'admin', true, $3, NOW(), NOW()) RETURNING id`,
        [firebaseUid, DEMO_EMAIL, org.id],
      );
      console.log('Created demo admin id:', adminUser.id);
    } else {
      console.log('Demo admin exists id:', adminUser.id);
    }

    // ── Wipe demo content (keep org + admin) ────────────────────────────────
    await q.query(`DELETE FROM tickets WHERE organization_id = $1`, [org.id]);
    await q.query(
      `DELETE FROM users WHERE organization_id = $1 AND role = 'agent'`,
      [org.id],
    );
    await q.query(`DELETE FROM categories WHERE organization_id = $1`, [
      org.id,
    ]);
    console.log('Wiped demo content.');

    // ── Categories ───────────────────────────────────────────────────────────
    const [catBilling] = await q.query(
      `INSERT INTO categories (name, is_active, organization_id, created_at)
       VALUES ('Billing', true, $1, NOW()) RETURNING id`,
      [org.id],
    );
    const [catTech] = await q.query(
      `INSERT INTO categories (name, is_active, organization_id, created_at)
       VALUES ('Technical Support', true, $1, NOW()) RETURNING id`,
      [org.id],
    );
    const [catGeneral] = await q.query(
      `INSERT INTO categories (name, is_active, organization_id, created_at)
       VALUES ('General Inquiry', true, $1, NOW()) RETURNING id`,
      [org.id],
    );

    // ── Agents (fake firebase_uids — nobody logs in as them) ─────────────────
    const [agent1] = await q.query(
      `INSERT INTO users (firebase_uid, email, full_name, role, is_active, organization_id, created_at, updated_at)
       VALUES ('demo-agent-1', 'sarah@democompany.com', 'Sarah Mitchell', 'agent', true, $1, NOW(), NOW()) RETURNING id`,
      [org.id],
    );
    const [agent2] = await q.query(
      `INSERT INTO users (firebase_uid, email, full_name, role, is_active, organization_id, created_at, updated_at)
       VALUES ('demo-agent-2', 'james@democompany.com', 'James Carter', 'agent', true, $1, NOW(), NOW()) RETURNING id`,
      [org.id],
    );
    console.log('Created categories and agents.');

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // ── Tickets + messages ───────────────────────────────────────────────────

    // 1. open / high / Billing
    const [t1] = await q.query(
      `INSERT INTO tickets (reference_number, customer_name, customer_email, subject, description, status, priority, organization_id, assigned_to, category_id, created_at, updated_at)
       VALUES ($1,'Alice Johnson','alice@example.com','Unable to update payment method',
               'I have been trying to update my credit card but the system keeps showing an error.',
               'open','high',$2,$3,$4, NOW(), NOW()) RETURNING id`,
      [`TKT-${date}-DEMO-01`, org.id, agent1.id, catBilling.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at)
       VALUES ($1,'I have been trying to update my credit card but the system keeps showing an error.','customer','Alice Johnson',false, NOW())`,
      [t1.id],
    );

    // 2. in_progress / urgent / Technical Support
    const [t2] = await q.query(
      `INSERT INTO tickets (reference_number, customer_name, customer_email, subject, description, status, priority, organization_id, assigned_to, category_id, created_at, updated_at)
       VALUES ($1,'Bob Smith','bob@example.com','App crashes on startup',
               'Every time I open the app on my iPhone it crashes immediately after the splash screen.',
               'in_progress','urgent',$2,$3,$4, NOW() - interval '3 hours', NOW()) RETURNING id`,
      [`TKT-${date}-DEMO-02`, org.id, agent2.id, catTech.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Every time I open the app on my iPhone it crashes immediately after the splash screen.','customer','Bob Smith',false, NOW() - interval '3 hours')`,
      [t2.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Hi Bob, can you tell me which iOS version you are running?','agent','James Carter',false, NOW() - interval '2 hours')`,
      [t2.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'I am on iOS 17.4. It started after your last update.','customer','Bob Smith',false, NOW() - interval '1 hour')`,
      [t2.id],
    );

    // 3. open / low / General Inquiry
    const [t3] = await q.query(
      `INSERT INTO tickets (reference_number, customer_name, customer_email, subject, description, status, priority, organization_id, assigned_to, category_id, created_at, updated_at)
       VALUES ($1,'Carol White','carol@example.com','How do I export my data?',
               'I would like to export all my data before cancelling my subscription.',
               'open','low',$2,$3,$4, NOW() - interval '1 day', NOW()) RETURNING id`,
      [`TKT-${date}-DEMO-03`, org.id, agent1.id, catGeneral.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'I would like to export all my data before cancelling my subscription.','customer','Carol White',false, NOW() - interval '1 day')`,
      [t3.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Checking with the product team on this one.','agent','Sarah Mitchell',true, NOW() - interval '20 hours')`,
      [t3.id],
    );

    // 4. resolved / high / Billing
    const [t4] = await q.query(
      `INSERT INTO tickets (reference_number, customer_name, customer_email, subject, description, status, priority, organization_id, assigned_to, category_id, resolved_at, created_at, updated_at)
       VALUES ($1,'David Lee','david@example.com','Charged twice this month',
               'I noticed two charges from your company on my bank statement this month.',
               'resolved','high',$2,$3,$4, NOW() - interval '1 hour', NOW() - interval '3 days', NOW()) RETURNING id`,
      [`TKT-${date}-DEMO-04`, org.id, agent2.id, catBilling.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'I noticed two charges from your company on my bank statement this month.','customer','David Lee',false, NOW() - interval '3 days')`,
      [t4.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Hi David, a duplicate charge did occur. I have submitted a refund — it should appear within 3-5 business days.','agent','James Carter',false, NOW() - interval '2 days')`,
      [t4.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Thank you! I can see the refund now.','customer','David Lee',false, NOW() - interval '1 hour')`,
      [t4.id],
    );

    // 5. closed / medium / Technical Support
    const [t5] = await q.query(
      `INSERT INTO tickets (reference_number, customer_name, customer_email, subject, description, status, priority, organization_id, assigned_to, category_id, resolved_at, closed_at, created_at, updated_at)
       VALUES ($1,'Emma Brown','emma@example.com','Cannot reset password',
               'The reset password email never arrives. I checked spam too.',
               'closed','medium',$2,$3,$4, NOW() - interval '2 days', NOW() - interval '1 day', NOW() - interval '5 days', NOW()) RETURNING id`,
      [`TKT-${date}-DEMO-05`, org.id, agent1.id, catTech.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'The reset password email never arrives. I checked spam too.','customer','Emma Brown',false, NOW() - interval '5 days')`,
      [t5.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Hi Emma, we have resent the reset link directly. Please check within 5 minutes.','agent','Sarah Mitchell',false, NOW() - interval '4 days')`,
      [t5.id],
    );
    await q.query(
      `INSERT INTO messages (ticket_id, body, sender_type, sender_name, is_internal, created_at) VALUES ($1,'Got it, working now. Thank you!','customer','Emma Brown',false, NOW() - interval '2 days')`,
      [t5.id],
    );

    console.log('Created 5 tickets with messages.');
    await q.commitTransaction();
    console.log('✓ Demo seed complete.');
  } catch (err) {
    await q.rollbackTransaction();
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await q.release();
    await AppDataSource.destroy();
    process.exit(0);
  }
}

seed();

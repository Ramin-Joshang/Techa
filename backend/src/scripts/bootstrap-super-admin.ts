import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import readline from 'node:readline';
import { UserModel } from '../models/user.model';
import { AdminAuditLogModel } from '../models/admin-audit-log.model';
import { normalizePhoneE164, verifyPassword } from '../modules/auth/auth.security';

function askQuestion(query: string, hidden: boolean = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function runBootstrap() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  console.log('🔒 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  try {
    // 1. Check if any active super_admin already exists
    const existingSuperAdminCount = await UserModel.countDocuments({
      roles: 'super_admin',
      status: 'active',
    });

    if (existingSuperAdminCount > 0) {
      console.error(
        `⛔ SECURITY ABORT: A super_admin account already exists in this database (${existingSuperAdminCount} found).`
      );
      console.error('Initial bootstrap command can only be executed once when no super_admin exists.');
      process.exit(1);
    }

    // 2. Prompt for target user's phone number
    const rawPhone = await askQuestion('Enter existing user mobile number (e.g. 09123456789): ');
    if (!rawPhone) {
      console.error('❌ Mobile number is required.');
      process.exit(1);
    }

    const phoneE164 = normalizePhoneE164(rawPhone);
    const targetUser = await UserModel.findOne({ phoneE164 });

    if (!targetUser) {
      console.error(`❌ User with phone ${phoneE164} does not exist. Register the user first.`);
      process.exit(1);
    }

    // 3. Prompt for password verification to ensure the operator possesses credentials
    const password = await askQuestion('Enter user password to confirm identity: ');
    if (!targetUser.passwordHash) {
      console.error('❌ Target user does not have a password configured.');
      process.exit(1);
    }

    const isPasswordValid = await verifyPassword(targetUser.passwordHash, password);
    if (!isPasswordValid) {
      console.error('❌ Incorrect password. Bootstrap aborted.');
      process.exit(1);
    }

    // 4. Confirm elevation
    const confirm = await askQuestion(
      `Are you sure you want to promote ${targetUser.firstName || ''} ${targetUser.lastName || ''} (${phoneE164}) to super_admin? (yes/no): `
    );

    if (confirm.toLowerCase() !== 'yes') {
      console.log('Operation cancelled by operator.');
      process.exit(0);
    }

    // 5. Elevate user in MongoDB: ensure verified and active, append super_admin
    const currentRoles = targetUser.roles || [];
    if (!currentRoles.includes('super_admin')) {
      currentRoles.push('super_admin');
    }
    if (!currentRoles.includes('admin')) {
      currentRoles.push('admin');
    }

    targetUser.roles = currentRoles;
    targetUser.status = 'active';
    if (!targetUser.phoneVerifiedAt) {
      targetUser.phoneVerifiedAt = new Date();
    }
    await targetUser.save();

    // 6. Record Audit Log
    await AdminAuditLogModel.create({
      actorUserId: targetUser._id,
      actorRole: 'super_admin',
      action: 'role_change',
      resourceType: 'user',
      resourceId: targetUser._id.toString(),
      result: 'success',
      requestId: 'bootstrap-cli',
      changedFields: ['roles', 'status', 'phoneVerifiedAt'],
      changeSummary: `Initial super_admin bootstrap executed via CLI for ${phoneE164}`,
      ipHash: 'bootstrap_cli',
    });

    console.log(`🎉 SUCCESS: User ${phoneE164} has been promoted to super_admin.`);
  } finally {
    await mongoose.disconnect();
    console.log('🔒 Disconnected from MongoDB.');
  }
}

runBootstrap().catch((err) => {
  console.error('❌ Bootstrap failed with error:', err.message);
  process.exit(1);
});

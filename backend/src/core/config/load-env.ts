import path from 'node:path';
import dotenv from 'dotenv';

// لود امن از پوشه فعلی، ریشه بک‌اند و ریشه مونورپو (بدون بازنویسی متغیرهای ست‌شده سیستم)
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const envPath of candidatePaths) {
  dotenv.config({ path: envPath });
}


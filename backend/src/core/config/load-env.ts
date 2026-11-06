import path from 'path';
import dotenv from 'dotenv';

// تلاش برای لود از ریشه و همچنین پوشه backend
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

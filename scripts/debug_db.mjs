import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

// We need to parse the DB URL or get components
// Since we don't have the DB URL easily, let's skip this for now.

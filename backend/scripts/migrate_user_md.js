const postgres = require('postgres');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/marketplace_backend';
const sql = postgres(dbUrl);

async function migrate() {
  console.log('Aplicando campos de marketplace.md a marketplace_backend...');

  await sql.unsafe(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'BUYER';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at timestamp with time zone;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date date;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS language varchar(10) DEFAULT 'es';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS currency varchar(10) DEFAULT 'USD';

    UPDATE users SET type = COALESCE(role, 'BUYER') WHERE type IS NULL;
    UPDATE users SET email_verified_at = created_at WHERE email_verified = true AND email_verified_at IS NULL;

    CREATE TABLE IF NOT EXISTS user_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name varchar(100) NOT NULL,
      last_name varchar(100) NOT NULL,
      avatar_url text,
      birth_date date,
      language varchar(10) DEFAULT 'es' NOT NULL,
      currency varchar(10) DEFAULT 'USD' NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      legal_name varchar(255) NOT NULL,
      trade_name varchar(255),
      tax_id varchar(50) NOT NULL,
      legal_type varchar(50),
      fiscal_address text,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code varchar(50) NOT NULL UNIQUE,
      name varchar(100) NOT NULL,
      is_system boolean DEFAULT false NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      resource varchar(50) NOT NULL,
      action varchar(50) NOT NULL,
      code varchar(100) NOT NULL UNIQUE,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  console.log('✅ Migración de marketplace.md completada con éxito.');
  const cols = await sql.unsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log('Columnas finales en users:', cols.map(c => `${c.column_name} (${c.data_type})`));
  await sql.end();
}

migrate().catch((err) => {
  console.error('❌ Error ejecutando migración:', err);
  process.exit(1);
});

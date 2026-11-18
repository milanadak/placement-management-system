const fs = require('fs');
const path = require('path');

const targetProvider = process.argv[2]?.toLowerCase();
if (!['sqlite', 'postgresql', 'postgres'].includes(targetProvider)) {
  console.log("Usage: node scripts/switch-db.js <sqlite|postgresql>");
  process.exit(1);
}

const providerName = targetProvider === 'postgres' ? 'postgresql' : targetProvider;
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(
  /datasource\s+db\s+\{[\s\S]*?provider\s*=\s*["'](sqlite|postgresql)["'][\s\S]*?\}/,
  `datasource db {\n  provider = "${providerName}"\n  url      = env("DATABASE_URL")\n}`
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log(`✓ Switched Prisma datasource provider to: "${providerName}"`);

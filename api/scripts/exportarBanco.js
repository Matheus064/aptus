const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.resolve(process.env.DATABASE_PATH || './db/aptus.db');
const outputPath = path.resolve(process.argv[2] || './db/aptus-backup.sql');
const incluirDados = process.argv.includes('--incluir-dados');

const quoteIdentifier = (value) => `"${String(value).replaceAll('"', '""')}"`;

const quoteValue = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (Buffer.isBuffer(value)) return `X'${value.toString('hex')}'`;
  return `'${String(value).replaceAll("'", "''")}'`;
};

const all = (database, sql, parameters = []) => new Promise((resolve, reject) => {
  database.all(sql, parameters, (error, rows) => error ? reject(error) : resolve(rows));
});

const run = (database, sql) => new Promise((resolve, reject) => {
  database.run(sql, (error) => error ? reject(error) : resolve());
});

const exportarBanco = async () => {
  if (!fs.existsSync(databasePath)) {
    throw new Error(`Banco não encontrado: ${databasePath}`);
  }

  const database = new sqlite3.Database(databasePath);
  try {
    const objects = await all(database, `
      SELECT type, name, sql
      FROM sqlite_master
      WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
      ORDER BY CASE type WHEN 'table' THEN 1 WHEN 'index' THEN 2 ELSE 3 END, name
    `);
    const tables = objects.filter((object) => object.type === 'table');
    const lines = [
      '-- Dump gerado por api/scripts/exportarBanco.js',
      'PRAGMA foreign_keys = OFF;',
      'BEGIN TRANSACTION;',
      ...tables.map((table) => `${table.sql};`),
    ];

    for (const table of tables) {
      const columns = await all(database, `PRAGMA table_info(${quoteIdentifier(table.name)})`);
      const columnList = columns.map((column) => quoteIdentifier(column.name)).join(', ');
      if (incluirDados) {
        const rows = await all(database, `SELECT * FROM ${quoteIdentifier(table.name)}`);
        for (const row of rows) {
          const values = columns.map((column) => quoteValue(row[column.name])).join(', ');
          lines.push(`INSERT INTO ${quoteIdentifier(table.name)} (${columnList}) VALUES (${values});`);
        }
      }
    }

    lines.push(...objects
      .filter((object) => object.type !== 'table')
      .map((object) => `${object.sql};`));
    lines.push('COMMIT;', 'PRAGMA foreign_keys = ON;', '');

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${lines.join('\n')}`, 'utf8');
    console.log(`Backup exportado para ${outputPath}`);
  } finally {
    database.close();
  }
};

exportarBanco().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
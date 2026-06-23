const { poolPromise } = require('./db');
async function main() {
  const pool = await poolPromise;
  const r = await pool.request().query('SELECT TOP 2 * FROM AuditLog');
  if (r.recordset.length > 0) {
    console.log('Columns:', Object.keys(r.recordset[0]));
    console.log('Data:', JSON.stringify(r.recordset, null, 2));
  } else {
    const schema = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AuditLog' ORDER BY ORDINAL_POSITION");
    console.log('Schema:', schema.recordset);
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });

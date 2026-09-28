import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve(process.argv[2] || 'data/blog.sqlite')
const output = resolve(process.argv[3] || 'data/d1-import.sql')
if (source === output) throw new Error('Output must not overwrite the source database')
const db = new DatabaseSync(source, { readOnly: true })
const columns = db.prepare('PRAGMA table_info(posts)').all().map(column => column.name)
const rows = db.prepare('SELECT * FROM posts ORDER BY id').all()
const fields = ['id', 'slug', 'title', 'body', 'body_format', 'status', 'created_at', 'updated_at']
const quote = value => typeof value === 'number' ? String(value) : `CAST(X'${Buffer.from(String(value), 'utf8').toString('hex')}' AS TEXT)`
const sql = rows.map(row => {
  if (!columns.includes('body_format')) row.body_format = 'markdown'
  return `INSERT INTO posts (${fields.join(', ')}) VALUES (${fields.map(field => quote(row[field])).join(', ')});`
}).join('\n')
writeFileSync(output, sql + '\n', { flag: 'wx', mode: 0o600 })
db.close()
console.log(`Exported ${rows.length} posts to ${output}. Source database unchanged.`)

import postgres from 'postgres'

async function main() {
  try {
    const url = process.env.DATABASE_URL
    if (!url) {
      console.error('DATABASE_URL is not set')
      process.exit(1)
    }

    const sql = postgres(url)
    const [{ now }] = await sql`select now()`
    const [{ version }] = await sql`select version()`

    console.log('[DB CHECK] Connected successfully')
    console.log('[DB CHECK] now:', now)
    console.log('[DB CHECK] version:', version)

    await sql.end({ timeout: 1 })
    process.exit(0)
  } catch (err) {
    console.error('[DB CHECK] Connection failed:', err?.message || err)
    process.exit(2)
  }
}

main()


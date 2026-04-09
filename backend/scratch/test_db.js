import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.nzaxrapwjxceptqplqyg:MNSbopw3RN8fSdpE@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
});

async function test() {
  console.log("Connecting...");
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Query result:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Connection error:", err.stack);
    process.exit(1);
  }
}

test();

import { Pool, PoolConfig, QueryResult, QueryResultRow } from "pg";

/**
 * Database pool configuration with sensible defaults
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

/**
 * PostgreSQL connection pool instance
 */
const pool = new Pool(poolConfig);

/**
 * Handle pool errors to prevent application crashes
 */
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

/**
 * Execute a parameterized SQL query
 * @param text SQL query string with optional placeholders ($1, $2, etc.)
 * @param params Array of parameters for the query
 * @returns QueryResult with rows and metadata
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } catch (error) {
    console.error("Database query error:", error);
    console.error("Query:", text);
    console.error("Params:", params);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return a single row
 * @param text SQL query string
 * @param params Query parameters
 * @returns Single row object or null if not found
 */
export async function getOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return multiple rows
 * @param text SQL query string
 * @param params Query parameters
 * @returns Array of row objects
 */
export async function getMany<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Execute a query without returning results (INSERT, UPDATE, DELETE)
 * @param text SQL query string
 * @param params Query parameters
 */
export async function executeOne(
  text: string,
  params?: unknown[],
): Promise<void> {
  await query(text, params);
}

/**
 * Check database connectivity and health
 * @returns True if database is accessible, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query("SELECT 1 as health");
    return result.rows.length === 1 && result.rows[0].health === 1;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Close all database connections in the pool
 * Should be called during application shutdown
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;

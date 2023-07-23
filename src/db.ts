import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  user: process.env.PG_DB_USER_NAME,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_DB_USER_PASSWORD,
  port: parseInt(process.env.PG_DB_PORT as string),
  host: process.env.PG_DB_HOST,
});

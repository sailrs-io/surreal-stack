import Surreal from "surrealdb.js";
import invariant from "tiny-invariant";

import {
  DATABASE_URL,
  SURREAL_DATABASE,
  SURREAL_NAMESPACE,
  SURREAL_PASS,
  SURREAL_USER,
} from "../env.server";

let db: Surreal;

declare global {
  var __db__: Surreal;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
  db = getClient();
} else {
  if (!global.__db__) {
    global.__db__ = getClient();
  }
  db = global.__db__;
}

function getClient() {
  invariant(typeof DATABASE_URL === "string", "DATABASE_URL env var not set");
  invariant(typeof SURREAL_USER === "string", "SURREAL_USER env var not set");
  invariant(typeof SURREAL_PASS === "string", "SURREAL_PASS env var not set");
  invariant(
    typeof SURREAL_NAMESPACE === "string",
    "SURREAL_NAMESPACE env var not set"
  );
  invariant(
    typeof SURREAL_DATABASE === "string",
    "SURREAL_DATABASE env var not set"
  );

  const databaseUrl = new URL(DATABASE_URL);

  const isLocalHost = databaseUrl.hostname === "localhost";

  const PRIMARY_REGION = isLocalHost ? null : process.env.PRIMARY_REGION;
  const FLY_REGION = isLocalHost ? null : process.env.FLY_REGION;

  const isReadReplicaRegion = !PRIMARY_REGION || PRIMARY_REGION === FLY_REGION;

  if (!isLocalHost) {
    databaseUrl.host = `${FLY_REGION}.${databaseUrl.host}`;
    if (!isReadReplicaRegion) {
      // 5433 is the read-replica port
      databaseUrl.port = "5433";
    }
  }

  console.log(`🔌 setting up surreal client to ${databaseUrl.host}`);

  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  const client = new Surreal(DATABASE_URL);
  // connect eagerly
  client.signin({ user: SURREAL_USER, pass: SURREAL_PASS });
  client.use(SURREAL_NAMESPACE, SURREAL_DATABASE);

  return client;
}

export function getResult<T>(
  response: Array<{ result?: T[] }> | { result?: T[] }
): T | null | undefined {
  const results = getResults<T>(response);
  if (results?.length) {
    return results[0];
  }
}

export function getResults<T>(
  response: Array<{ result?: T[] }> | { result?: T[] }
): T[] | null | undefined {
  if (Array.isArray(response)) {
    // db.query
    const [res] = response;
    const { result } = res;
    if (result) {
      return result;
    }
  } else {
    // db.select
    const { result } = response;
    if (result) {
      return result;
    }
    return null;
  }
}

export { db };

import Surreal from "surrealdb.js";
import bcrypt from "bcryptjs";

// type Result<T = {}> = T extends Record<string, infer Value> ? Value : T;

// type Result<T> = T extends Array<infer U> ? U : T;

// type F = Result<[{ a: number }]>;

const db = new Surreal("http://127.0.0.1:8000/rpc");

async function main() {
  try {
    // Signin as a namespace, database, or root user
    await db.signin({
      user: "root",
      pass: "root",
    });

    // Selecta specific namespace / database
    await db.use("test", "test");

    // Create a new user
    const user = await db.create("user", {
      email: "john@doe.tld",
      password: await bcrypt.hash("password", 10),
    });
    console.log('db.create(user)', user);

    let response;

    // response = await db.select('user');
    // console.log("db.select(user).response", response);

    response = await db.change(user.id, {
        email: "foo@bar.com"
    })
    console.log("db.change(user).response", response);

    response = await db.select(user.id);
    console.log("db.select(user.id).response", response);

    response = await db.delete(user.id);
    console.log("db.delete(user.id).response", response);

    // Perform a custom advanced query
    response = await db.query('SELECT * FROM type::table($tb);', {
      tb: 'user',
    });

    console.log('query', response);

  } catch (e) {
    console.error("ERROR", e);
  }
}

main();

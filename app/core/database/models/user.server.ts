import bcrypt from "bcryptjs";
import { db, getResult } from "../database.server";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export async function getUserById(id: string) {
  try {
    const [user] =  await db.select<User>(`user:${id}`);
    return user;
  } catch (error: any) {
    console.error('getUserById.error', error?.message ?? error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const response = await db.query<User>(
    "SELECT * FROM type::table($table) WHERE email = $email;",
    {
      table: "user",
      email,
    }
  );
  const ret = getResult<User>(response);
  console.debug('getUserByEmail', ret);
  return ret;
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.create<User>("user", {
    email,
    password: hashedPassword,
  });

  console.debug('createUser', user);
  return user;
}

export async function deleteUserByEmail(email: string) {
  const user = await getUserByEmail(email);
  if (user) {
    db.delete(user.id);
  }
}

export async function verifyLogin(
  email: string,
  // the hash
  password: string
) {
  const userWithPassword = await getUserByEmail(email);
  console.debug('verifyLogin', userWithPassword);

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

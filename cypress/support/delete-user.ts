import { installGlobals } from "@remix-run/node";
import { getUserByEmail } from "~/core/database/models/user.server";


installGlobals();

async function deleteUser(email: string) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  await deleteUser(user.id);
}

deleteUser(process.argv[2]);

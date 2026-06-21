import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { usersTable } from '../models/index.js';

export async function getUserByEmail(email) {
  const [existingUser] = await db
    .select({
      id: usersTable.id,
      firstname: usersTable.firstname,
      lastname: usersTable.lastname,
      email: usersTable.email,
      salt: usersTable.salt,
      password: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return existingUser;
}

export async function createUser({ firstname, lastname, email, salt, password }) {
  const [createdUser] = await db
    .insert(usersTable)
    .values({
      firstname,
      lastname,
      email,
      salt,
      password,
    })
    .returning({ id: usersTable.id });

  return createdUser;
}
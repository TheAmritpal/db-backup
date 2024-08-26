import { db } from "@/db";
import { eq } from "drizzle-orm";
import type { Context } from "elysia";
import * as schema from "@/db/schema";
import { compare } from "bcrypt";
import { lucia } from "../lucia";
import { Respond } from "@/lib/respond";

export const SignIn = async (ctx: Context) => {
  try {
    type body = { email: string; password: string };
    const { email, password }: body = ctx.body as body;
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });
    if (!user) return Respond(404, { message: "Email not found" });
    const isValid = await compare(password, user.password);
    if (!isValid) return Respond(401, { message: "Incorrect Password" });
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    ctx.cookie[sessionCookie.name].set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });
    return Respond(200, {
      success: true,
      message: "Login Success",
    });
  } catch (error) {
    return Respond(500, { message: error.message });
  }
};

export const Logout = async (ctx: Context) => {
  const cookie = ctx.cookie
  console.log(cookie, "cookie");
  // await db.delete(schema.session).where(eq(schema.))
  return Respond(200, { cookieHeader: "asdsad" });
};

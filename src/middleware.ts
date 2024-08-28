import { verifyRequestOrigin } from "lucia";
import { defineMiddleware } from "astro:middleware";
import { lucia } from "@/server/lucia";
import { Respond } from "./lib/respond";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method !== "GET") {
    const originHeader = context.request.headers.get("Origin");
    const hostHeader = context.request.headers.get("Host");
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response(null, {
        status: 403,
      });
    }
  }
  console.log(context.request.method)
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    if (context.url.pathname.includes("/auth")) return next();
    return context.request.method === "GET"
      ? Response.redirect(new URL("/auth/sign-in", context.url))
      : Respond(401, { message: "unauthorized" });
  } else {
    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    console.log(JSON.stringify(context.locals, null, 2), context.request.method);
    context.locals.session = session;
    context.locals.user = user;

    if (context.url.pathname.includes("/auth/sign-in")) {
      return context.request.method === "GET"
        ? Response.redirect(new URL("/", context.url))
        : Respond(400, { message: "Already Logged in" });
    }

    return next();
  }
});

import type { Context } from "elysia";
import { createConnection, type ConnectionOptions } from "mysql2";

export const addDatabase = ({ body }: Context) => {
  try {
    const connection = createConnection(body as ConnectionOptions);
    console.log(connection, "connection");
    return body;
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

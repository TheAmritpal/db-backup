import { writeFile } from "fs/promises";

export async function generateMySQLDump(
  mysqlUserIformation: { user: string; password: string; database: string; host: string }
  // filePath: string
): Promise<boolean | ReadableStream<Uint8Array<ArrayBufferLike>>> {
  const MYSQL_USER = mysqlUserIformation.user;
  const MYSQL_PASSWORD = mysqlUserIformation.password;
  const MYSQL_DATABASE = mysqlUserIformation.database;
  const MYSQL_HOST = mysqlUserIformation.host;

  const dumpCommand = [
    "/usr/bin/mysqldump",
    `-u${MYSQL_USER}`,
    `-p${MYSQL_PASSWORD}`,
    `-h${MYSQL_HOST}`,
    MYSQL_DATABASE,
  ];

  const process = Bun.spawn(dumpCommand, {
    stdout: "pipe",
    stderr: "pipe",
  });

  // const stdoutText = await new Response(process.stdout).text();
  const stderrText = await new Response(process.stderr).text();

  const exitCode = await process.exited;
  if (exitCode !== 0) {
    console.error("❌ Failed to generate MySQL dump:", stderrText);
    return false;
  }
  return process.stdout;
  // Save dump output to file
  // await writeFile(filePath, stdoutText);
  // console.log(`✅ MySQL dump saved: ${filePath}`);
  // return true;

  // const dumpCommand = `mysqldump -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} ${MYSQL_DATABASE} > ${filePath}`;

  // try {
  //   await exec(dumpCommand);
  //   console.log(`✅ MySQL dump created: ${filePath}`);
  //   return true;
  // } catch (error) {
  //   console.error("❌ Failed to generate MySQL dump:", error);
  //   return false;
  // }
}

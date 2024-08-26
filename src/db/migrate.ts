import { db } from "@/db";
import { migrate } from "drizzle-orm/mysql2/migrator";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "src/db/migrations",
    });

    console.log("Migration completed!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();

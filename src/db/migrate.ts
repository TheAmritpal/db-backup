import { DatabaseConfig } from "@/db";
import { migrate } from "drizzle-orm/mysql2/migrator";

const main = async () => {
  try {
    const db = new DatabaseConfig();
    await migrate(db.drizzle, {
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

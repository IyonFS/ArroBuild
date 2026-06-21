import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js menggunakan .env.local — kita load manual untuk Prisma CLI
config({ path: ".env.local" });

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  throw new Error("DIRECT_URL is required in .env.local for Prisma migrations");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Gunakan DIRECT_URL (port 5432, tanpa pgBouncer) untuk migrations
    url: directUrl,
  },
});

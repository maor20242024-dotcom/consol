// scripts/check-db.ts
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // Simple query to verify connection
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection successful", { result });
        console.log("✅ DB connection verified");
    } catch (e) {
        console.error("Database connection failed", e);
        console.error("❌ DB connection error", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

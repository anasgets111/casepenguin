import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var cashedPrisma: PrismaClient;
}
let prisma: PrismaClient;
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.cashedPrisma) {
    global.cashedPrisma = new PrismaClient({ adapter });
  }
  prisma = global.cashedPrisma;
}
export const db = prisma;

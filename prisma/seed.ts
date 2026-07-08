import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@example.com";
  const userEmail = "user@example.com";

  // Check if admin already exists
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Default Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "Admin" as Role,
        bio: "Default administrator account.",
      },
    });
    console.log("✅ Admin user seeded successfully!");
  } else {
    console.log("ℹ️ Admin user already exists, skipping seed.");
  }

  // Check if standard user already exists
  const userExists = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userExists) {
    const hashedUserPassword = await bcrypt.hash("user123", 10);
    await prisma.user.create({
      data: {
        name: "Default User",
        email: userEmail,
        password: hashedUserPassword,
        role: "Customer" as Role,
        bio: "Default user account.",
      },
    });
    console.log("✅ Standard user seeded successfully!");
  } else {
    console.log("ℹ️ Standard user already exists, skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

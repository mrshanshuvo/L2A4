import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@example.com";
  const userEmail = "user@example.com";
  const providerEmail = "provider@example.com";

  // 1. Seed Admin
  let adminId = "";
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const createdAdmin = await prisma.user.create({
      data: {
        name: "Default Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "Admin" as Role,
        bio: "Default administrator account.",
      },
    });
    adminId = createdAdmin.id;
    console.log("✅ Admin user seeded successfully!");
  } else {
    adminId = adminExists.id;
    console.log("ℹ️ Admin user already exists, skipping seed.");
  }

  // 2. Seed Customer
  let customerId = "";
  const userExists = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!userExists) {
    const hashedUserPassword = await bcrypt.hash("user123", 10);
    const createdCustomer = await prisma.user.create({
      data: {
        name: "Default User",
        email: userEmail,
        password: hashedUserPassword,
        role: "Customer" as Role,
        bio: "Default user account.",
      },
    });
    customerId = createdCustomer.id;
    console.log("✅ Standard user seeded successfully!");
  } else {
    customerId = userExists.id;
    console.log("ℹ️ Standard user already exists, skipping seed.");
  }

  // 3. Seed Provider
  let providerId = "";
  const providerExists = await prisma.user.findUnique({
    where: { email: providerEmail },
  });

  if (!providerExists) {
    const hashedProviderPassword = await bcrypt.hash("provider123", 10);
    const createdProvider = await prisma.user.create({
      data: {
        name: "Default Provider",
        email: providerEmail,
        password: hashedProviderPassword,
        role: "Provider" as Role,
        bio: "Default provider shop account.",
      },
    });
    providerId = createdProvider.id;
    console.log("✅ Provider user seeded successfully!");
  } else {
    providerId = providerExists.id;
    console.log("ℹ️ Provider user already exists, skipping seed.");
  }

  // 4. Seed Categories
  const categoryNames = ["Cycling", "Camping", "Water Sports", "Fitness"];
  const categories: Record<string, string> = {};

  for (const name of categoryNames) {
    const exists = await prisma.category.findUnique({
      where: { name },
    });
    if (!exists) {
      const created = await prisma.category.create({
        data: {
          name,
          description: `Gear for all your ${name.toLowerCase()} activities.`,
        },
      });
      categories[name] = created.id;
      console.log(`✅ Category '${name}' seeded successfully!`);
    } else {
      categories[name] = exists.id;
      console.log(`ℹ️ Category '${name}' already exists.`);
    }
  }

  // 5. Seed Gear Items
  const gearItemsData = [
    {
      name: "Mountain Bike Pro",
      description: "21-speed high performance trail mountain bike.",
      brand: "Trek",
      pricePerDay: 25.0,
      stock: 5,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      categoryName: "Cycling",
    },
    {
      name: "4-Person Camping Tent",
      description: "Waterproof family camping tent with double layer.",
      brand: "Coleman",
      pricePerDay: 15.0,
      stock: 8,
      imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      categoryName: "Camping",
    },
    {
      name: "Inflatable Stand Up Paddleboard",
      description: "Premium SUP board with pump, paddle, and travel bag.",
      brand: "iRocker",
      pricePerDay: 35.0,
      stock: 3,
      imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f",
      categoryName: "Water Sports",
    },
  ];

  for (const item of gearItemsData) {
    const exists = await prisma.gearItem.findFirst({
      where: { name: item.name },
    });

    if (!exists) {
      const categoryId = categories[item.categoryName];
      if (categoryId) {
        await prisma.gearItem.create({
          data: {
            name: item.name,
            description: item.description,
            brand: item.brand,
            pricePerDay: item.pricePerDay,
            stock: item.stock,
            imageUrl: item.imageUrl,
            categoryId,
            providerId,
          },
        });
        console.log(`✅ Gear item '${item.name}' seeded successfully!`);
      }
    } else {
      console.log(`ℹ️ Gear item '${item.name}' already exists.`);
    }
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

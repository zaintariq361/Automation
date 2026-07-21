import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-bakery" },
    update: {},
    create: {
      name: "Demo Bakery Co.",
      slug: "demo-bakery",
      users: {
        create: {
          email: "owner@demo-bakery.test",
          name: "Demo Owner",
          passwordHash,
          role: "OWNER",
        },
      },
    },
  });

  await prisma.product.createMany({
    data: [
      {
        tenantId: tenant.id,
        externalId: "demo-1",
        title: "Chocolate Fudge Cake (Serves 15)",
        description: "Rich chocolate fudge cake, perfect for large gatherings.",
        price: 2800,
        currency: "USD",
        inventory: 20,
      },
      {
        tenantId: tenant.id,
        externalId: "demo-2",
        title: "Classic Birthday Cake",
        description: "Vanilla sponge with buttercream frosting.",
        price: 1500,
        currency: "USD",
        inventory: 35,
      },
      {
        tenantId: tenant.id,
        externalId: "demo-3",
        title: "Red Velvet Cupcakes (Box of 12)",
        description: "Classic red velvet cupcakes with cream cheese frosting.",
        price: 900,
        currency: "USD",
        inventory: 50,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded tenant "${tenant.name}" (login: owner@demo-bakery.test / password123)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

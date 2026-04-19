import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const appNames = ["D365", "Simplix", "Finance"];
  const apps = await Promise.all(
    appNames.map((name) =>
      prisma.application.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    ),
  );
  const [d365, simplix, finance] = apps;

  const admin = await prisma.user.upsert({
    where: { email: "admin@mtcc.mv" },
    create: {
      email: "admin@mtcc.mv",
      name: "Admin User",
      isAdmin: true,
      allApplications: true,
    },
    update: { isAdmin: true, allApplications: true },
  });

  const allAccessUser = await prisma.user.upsert({
    where: { email: "viewer.all@mtcc.mv" },
    create: {
      email: "viewer.all@mtcc.mv",
      name: "All Apps Viewer",
      allApplications: true,
    },
    update: { allApplications: true },
  });

  const d365User = await prisma.user.upsert({
    where: { email: "viewer.d365@mtcc.mv" },
    create: { email: "viewer.d365@mtcc.mv", name: "D365 Viewer" },
    update: {},
  });
  await prisma.userAppAccess.upsert({
    where: { userId_applicationId: { userId: d365User.id, applicationId: d365.id } },
    create: { userId: d365User.id, applicationId: d365.id },
    update: {},
  });

  const simplixUser = await prisma.user.upsert({
    where: { email: "viewer.simplix@mtcc.mv" },
    create: { email: "viewer.simplix@mtcc.mv", name: "Simplix Viewer" },
    update: {},
  });
  await prisma.userAppAccess.upsert({
    where: { userId_applicationId: { userId: simplixUser.id, applicationId: simplix.id } },
    create: { userId: simplixUser.id, applicationId: simplix.id },
    update: {},
  });

  console.log("Seeded:");
  console.log("  Applications:", apps.map((a) => a.name).join(", "));
  console.log("  Users: admin@mtcc.mv (admin + all apps)");
  console.log("         viewer.all@mtcc.mv (all apps)");
  console.log("         viewer.d365@mtcc.mv (D365 only)");
  console.log("         viewer.simplix@mtcc.mv (Simplix only)");
  void finance;
  void allAccessUser;
  void admin;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

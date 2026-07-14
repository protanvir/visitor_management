import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.badge.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.safetyChecklist.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.user.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.site.deleteMany();
  await prisma.organization.deleteMany();
  console.log("✅ Cleared existing data");

  // Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: "Aptech Group",
      settings: {
        defaultTimezone: "Asia/Dhaka",
        requireNDA: true,
        requireSafetyBriefing: true,
        maxVisitDurationHours: 8,
      },
    },
  });
  console.log("✅ Created organization:", organization.name);

  // Create Sites
  const mainOffice = await prisma.site.create({
    data: {
      organizationId: organization.id,
      name: "Main Office",
      address: "123 Business Avenue, Dhaka 1212, Bangladesh",
      timezone: "Asia/Dhaka",
      settings: {
        requireNDA: false,
        safetyChecklist: false,
        maxOccupancy: 200,
      },
    },
  });

  const factory = await prisma.site.create({
    data: {
      organizationId: organization.id,
      name: "Factory",
      address: "456 Industrial Road, Gazipur 1704, Bangladesh",
      timezone: "Asia/Dhaka",
      settings: {
        requireNDA: true,
        safetyChecklist: true,
        maxOccupancy: 150,
      },
    },
  });
  console.log("✅ Created sites:", mainOffice.name, ",", factory.name);

  // Create Employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        organizationId: organization.id,
        siteId: mainOffice.id,
        email: "rahman@aptechgroup.com",
        name: "Abdul Rahman",
        department: "Management",
        role: "admin",
        phone: "+8801712345678",
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: organization.id,
        siteId: mainOffice.id,
        email: "fatima@aptechgroup.com",
        name: "Fatima Khan",
        department: "HR",
        role: "receptionist",
        phone: "+8801712345679",
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: organization.id,
        siteId: mainOffice.id,
        email: "karim@aptechgroup.com",
        name: "Karim Ahmed",
        department: "Engineering",
        role: "employee",
        phone: "+8801712345680",
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: organization.id,
        siteId: factory.id,
        email: "hasan@aptechgroup.com",
        name: "Mohammad Hasan",
        department: "Production",
        role: "employee",
        phone: "+8801712345681",
      },
    }),
    prisma.employee.create({
      data: {
        organizationId: organization.id,
        siteId: factory.id,
        email: "security@aptechgroup.com",
        name: "Security Desk",
        department: "Security",
        role: "security",
        phone: "+8801712345682",
      },
    }),
  ]);
  console.log("✅ Created", employees.length, "employees");

  // Create Users (for authentication)
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@aptechgroup.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
      organizationId: organization.id,
      employeeId: employees[0].id, // Link to Abdul Rahman
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: "fatima@aptechgroup.com",
      name: "Fatima Khan",
      password: hashedPassword,
      role: "manager",
      organizationId: organization.id,
      employeeId: employees[1].id, // Link to Fatima Khan
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "karim@aptechgroup.com",
      name: "Karim Ahmed",
      password: hashedPassword,
      role: "user",
      organizationId: organization.id,
      employeeId: employees[2].id, // Link to Karim Ahmed
    },
  });

  console.log("✅ Created", 3, "users (admin, manager, regular)");

  // Create Visitors
  const visitors = await Promise.all([
    prisma.visitor.create({
      data: {
        visitorCode: "V-001ABC",
        email: "visitor1@example.com",
        name: "Rahul Sharma",
        phone: "+919876543210",
        company: "Tech Solutions India",
      },
    }),
    prisma.visitor.create({
      data: {
        visitorCode: "V-002DEF",
        email: "visitor2@example.com",
        name: "Sarah Wilson",
        phone: "+447911123456",
        company: "Global Consulting UK",
      },
    }),
    prisma.visitor.create({
      data: {
        visitorCode: "V-003GHI",
        email: "visitor3@example.com",
        name: "Ahmed Ali",
        phone: "+8801812345678",
        company: "Local Supplier Ltd",
      },
    }),
    prisma.visitor.create({
      data: {
        visitorCode: "V-004JKL",
        email: "visitor4@example.com",
        name: "John Smith",
        phone: "+14155551234",
        company: "American Tech Corp",
      },
    }),
    prisma.visitor.create({
      data: {
        visitorCode: "V-005MNO",
        email: "visitor5@example.com",
        name: "Li Wei",
        phone: "+8613812345678",
        company: "Shanghai Manufacturing",
      },
    }),
  ]);
  console.log("✅ Created", visitors.length, "visitors");

  // Create Visits
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const visits = await Promise.all([
    // Completed visits
    prisma.visit.create({
      data: {
        visitorId: visitors[0].id,
        hostId: employees[2].id,
        siteId: mainOffice.id,
        purpose: "Project meeting",
        visitorType: "guest",
        checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        checkOutTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        status: "checked_out",
        ndaSigned: true,
        safetyBriefing: false,
      },
    }),
    prisma.visit.create({
      data: {
        visitorId: visitors[1].id,
        hostId: employees[0].id,
        siteId: mainOffice.id,
        purpose: "Business proposal presentation",
        visitorType: "vendor",
        checkInTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        checkOutTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        status: "checked_out",
        ndaSigned: true,
        safetyBriefing: false,
      },
    }),
    // Active visits
    prisma.visit.create({
      data: {
        visitorId: visitors[2].id,
        hostId: employees[3].id,
        siteId: factory.id,
        purpose: "Delivery of raw materials",
        visitorType: "delivery",
        checkInTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM
        status: "checked_in",
        ndaSigned: true,
        safetyBriefing: true,
      },
    }),
    prisma.visit.create({
      data: {
        visitorId: visitors[3].id,
        hostId: employees[2].id,
        siteId: mainOffice.id,
        purpose: "Technical consultation",
        visitorType: "contractor",
        checkInTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        status: "checked_in",
        ndaSigned: true,
        safetyBriefing: false,
      },
    }),
    // Pending visit
    prisma.visit.create({
      data: {
        visitorId: visitors[4].id,
        hostId: employees[3].id,
        siteId: factory.id,
        purpose: "Factory tour and inspection",
        visitorType: "guest",
        expectedArrival: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        status: "pending",
        ndaSigned: false,
        safetyBriefing: false,
      },
    }),
  ]);
  console.log("✅ Created", visits.length, "visits");

  // Create Badges for active visits
  const QRCode = await import("qrcode");

  for (const visit of visits.filter((v) => v.status === "checked_in")) {
    const qrCode = await QRCode.default.toDataURL(visit.id, {
      width: 300,
      margin: 2,
    });

    const expiresAt = new Date(visit.checkInTime!);
    expiresAt.setHours(expiresAt.getHours() + 8);

    await prisma.badge.create({
      data: {
        visitId: visit.id,
        qrCode,
        expiresAt,
      },
    });
  }
  console.log("✅ Created badges for active visits");

  // Create Watchlist entries
  await prisma.watchlist.createMany({
    data: [
      {
        organizationId: organization.id,
        email: "blocked@example.com",
        name: "Blocked Person",
        reason: "Previously violated NDA",
        active: true,
      },
      {
        organizationId: organization.id,
        name: "Banned Company Representative",
        phone: "+8801999999999",
        reason: "Company blacklist",
        active: true,
      },
    ],
  });
  console.log("✅ Created watchlist entries");

  console.log("\n🎉 Database seeding complete!");
  console.log("\n📊 Summary:");
  console.log("   - 1 Organization (Aptech Group)");
  console.log("   - 2 Sites (Main Office, Factory)");
  console.log("   - 5 Employees");
  console.log("   - 3 Users (admin, manager, regular)");
  console.log("   - 5 Visitors");
  console.log("   - 5 Visits (2 completed, 2 active, 1 pending)");
  console.log("   - 2 Badges (for active visits)");
  console.log("   - 2 Watchlist entries");
  console.log("\n🔐 Login Credentials (all users):");
  console.log("   - Email: admin@aptechgroup.com | Password: admin123");
  console.log("   - Email: fatima@aptechgroup.com | Password: admin123");
  console.log("   - Email: karim@aptechgroup.com | Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, UserRole, LoanStatus, ReferralStatus, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Clean existing seed data to ensure re-runnability
  // (We do this only for our new tables to avoid touching database's legacy tables)
  await prisma.referral.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.loanApplication.deleteMany({});
  await prisma.cibilScore.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.oTP.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create the main demo user (Rajesh Kumar Mehta)
  const mainUser = await prisma.user.create({
    data: {
      phone: '9908889635',
      name: 'Rajesh Kumar Mehta',
      companyName: 'Mehta Enterprises',
      location: 'Pune, Maharashtra',
      role: UserRole.USER,
      profileCompletion: 85,
    },
  });
  console.log(`Created demo user: ${mainUser.name} (${mainUser.phone})`);

  // 3. Create CIBIL Score History for the demo user
  const scoreHistory = [
    { monthOffset: 5, score: 710 }, // 5 months ago
    { monthOffset: 4, score: 718 },
    { monthOffset: 3, score: 725 },
    { monthOffset: 2, score: 730 },
    { monthOffset: 1, score: 738 },
    { monthOffset: 0, score: 742 }, // Latest score
  ];

  for (const item of scoreHistory) {
    const date = new Date();
    date.setMonth(date.getMonth() - item.monthOffset);
    await prisma.cibilScore.create({
      data: {
        userId: mainUser.id,
        score: item.score,
        reportUrl: 'https://bureau.reports.example.com/svk-2845102',
        createdAt: date,
      },
    });
  }
  console.log('Created CIBIL score history');

  // 4. Create Active Loan matching the front-end display
  const activeLoan = await prisma.loan.create({
    data: {
      userId: mainUser.id,
      loanNumber: 'SVK-2845102',
      amount: 187500,
      status: LoanStatus.ACTIVE,
      emiDue: 13850,
      nextDueDate: new Date('2026-05-12T00:00:00.000Z'),
    },
  });
  console.log(`Created active loan: ${activeLoan.loanNumber}`);

  // 5. Create default Loan Application
  const application = await prisma.loanApplication.create({
    data: {
      userId: mainUser.id,
      requestedAmount: 1500000,
      purpose: 'Machinery Purchase',
      status: ApplicationStatus.PENDING, // Maps to "In Progress"
      createdAt: new Date('2026-05-28T00:00:00.000Z'),
    },
  });
  console.log(`Created pending loan application: ${application.id}`);

  // 6. Create referred users to attach referrals to
  const referredUser1 = await prisma.user.create({
    data: {
      phone: '9823412345',
      name: 'Amit Sharma',
      profileCompletion: 0,
    },
  });

  const referredUser2 = await prisma.user.create({
    data: {
      phone: '8877665544',
      name: 'Sanjay Deshmukh',
      profileCompletion: 0,
    },
  });

  // 7. Create referrals
  await prisma.referral.create({
    data: {
      referrerId: mainUser.id,
      referredUserId: referredUser1.id,
      referralCode: 'REF-AMIT98',
      rewardAmount: 1500,
      status: ReferralStatus.COMPLETED, // Approved
      createdAt: new Date('2026-05-12T00:00:00.000Z'),
    },
  });

  await prisma.referral.create({
    data: {
      referrerId: mainUser.id,
      referredUserId: referredUser2.id,
      referralCode: 'REF-SANJ88',
      rewardAmount: 500,
      status: ReferralStatus.PENDING,
      createdAt: new Date('2026-05-25T00:00:00.000Z'),
    },
  });
  console.log('Created referral invites seed data');

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

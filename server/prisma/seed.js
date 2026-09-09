import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const BCRYPT_ROUNDS = 10;

const email = process.env.SEED_USER_EMAIL ?? 'test@oasis.dev';
const password = process.env.SEED_USER_PASSWORD ?? 'Password123!';

/** Days from today, as a Date — keeps seeded due dates from going stale. */
const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
};

const sampleTasks = [
  {
    title: 'Review the Oasis onboarding brief',
    description:
      'Read through the technical brief and note the acceptance criteria before starting implementation.',
    status: 'done',
    dueDate: daysFromNow(-3),
  },
  {
    title: 'Wire up the task API',
    description:
      'Ownership-scoped CRUD endpoints with Zod validation and a consistent error envelope.',
    status: 'in-progress',
    dueDate: daysFromNow(1),
  },
  {
    title: 'Polish the empty and error states',
    description:
      'Every async surface should render exactly one of loading, error, empty, or success.',
    status: 'pending',
    dueDate: daysFromNow(4),
  },
  {
    title: 'Write the README',
    description: null,
    status: 'pending',
    dueDate: null,
  },
];

async function main() {
  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  });

  // Re-seeding should be deterministic, not additive.
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.task.createMany({
    data: sampleTasks.map((task) => ({ ...task, userId: user.id })),
  });

  const count = await prisma.task.count({ where: { userId: user.id } });
  process.stdout.write(`Seeded ${email} with ${count} tasks.\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

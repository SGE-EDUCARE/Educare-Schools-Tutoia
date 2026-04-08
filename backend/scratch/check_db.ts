import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const levels = await prisma.academicLevel.count()
  const grades = await prisma.academicGrade.count()
  const turns = await prisma.academicTurn.count()
  const classes = await prisma.class.count()
  const students = await prisma.student.count()
  const users = await prisma.user.count()

  console.log('Database Stats:')
  console.log({ levels, grades, turns, classes, students, users })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())

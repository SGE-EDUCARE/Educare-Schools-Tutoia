import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando Semente (Seed)...')

  // 1. Criar Usuário Administrador (seu acesso)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@educare.com' },
    update: {},
    create: {
      email: 'admin@educare.com',
      name: 'Ezequiel Administrador',
      password_hash: hashedAdminPassword,
      role: 'DIRECTOR',
      active: true,
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // 2. Criar um Responsável (para testes de matrícula)
  const hashedParentPassword = await bcrypt.hash('parent123', 10)
  const parent = await prisma.user.upsert({
    where: { email: 'contato@pais.com' },
    update: {},
    create: {
      email: 'contato@pais.com',
      name: 'Responsável de Teste',
      password_hash: hashedParentPassword,
      role: 'PARENT',
      active: true,
    },
  })
  console.log('✅ Responsável criado:', parent.email)

  // 3. Estrutura Acadêmica: Níveis
  const fundamental = await prisma.academicLevel.upsert({
    where: { name: 'Ensino Fundamental I' },
    update: {},
    create: { name: 'Ensino Fundamental I' },
  })
  
  const infantil = await prisma.academicLevel.upsert({
    where: { name: 'Educação Infantil' },
    update: {},
    create: { name: 'Educação Infantil' },
  })
  console.log('✅ Níveis acadêmicos criados')

  // 4. Estrutura Acadêmica: Séries
  const grade1 = await prisma.academicGrade.create({
    data: { name: '1º Ano', level_id: fundamental.id }
  })
  const grade2 = await prisma.academicGrade.create({
    data: { name: '2º Ano', level_id: fundamental.id }
  })
  const infantilA = await prisma.academicGrade.create({
    data: { name: 'Pré-Escola A', level_id: infantil.id }
  })
  console.log('✅ Séries criadas')

  // 5. Turnos
  const matutino = await prisma.academicTurn.upsert({
    where: { name: 'Matutino' },
    update: {},
    create: { name: 'Matutino' },
  })
  const vespertino = await prisma.academicTurn.upsert({
    where: { name: 'Vespertino' },
    update: {},
    create: { name: 'Vespertino' },
  })
  console.log('✅ Turnos criados')

  // 6. Turma de Exemplo
  await prisma.class.create({
    data: {
      name: 'Turma Alfa',
      grade_id: grade1.id,
      turn_id: matutino.id
    }
  })
  console.log('✅ Turma de exemplo criada')

  console.log('\nSeed concluído com sucesso! 🚀')
  console.log('Use admin@educare.com / admin123 para entrar.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

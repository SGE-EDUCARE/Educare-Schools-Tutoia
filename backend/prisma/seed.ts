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
  let grade1 = await prisma.academicGrade.findFirst({ where: { name: '1º Ano', level_id: fundamental.id } })
  if (!grade1) grade1 = await prisma.academicGrade.create({ data: { name: '1º Ano', level_id: fundamental.id } })

  let grade2 = await prisma.academicGrade.findFirst({ where: { name: '2º Ano', level_id: fundamental.id } })
  if (!grade2) grade2 = await prisma.academicGrade.create({ data: { name: '2º Ano', level_id: fundamental.id } })

  let infantilA = await prisma.academicGrade.findFirst({ where: { name: 'Pré-Escola A', level_id: infantil.id } })
  if (!infantilA) infantilA = await prisma.academicGrade.create({ data: { name: 'Pré-Escola A', level_id: infantil.id } })

  console.log('✅ Séries tratadas (Idempotente)')

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
  await prisma.class.upsert({
    where: { id: 'turma-alfa-id' }, // Usando um ID fixo para o seed ser re-executável
    update: {},
    create: {
      id: 'turma-alfa-id',
      name: 'Turma Alfa',
      grade_id: grade1.id,
      turn_id: matutino.id
    }
  })
  console.log('✅ Turma de exemplo criada')

  // 7. Importar Habilidades BNCC
  console.log('⏳ Importando habilidades BNCC...')
  const fs = require('fs')
  const path = require('path')
  const bnccDataPath = path.join(__dirname, 'data', 'bncc-data.json')
  
  if (fs.existsSync(bnccDataPath)) {
    const bnccData = JSON.parse(fs.readFileSync(bnccDataPath, 'utf8'))
    for (const skill of bnccData) {
      await prisma.bnccSkill.upsert({
        where: { code: skill.code },
        update: {
          description: skill.description,
          subject: skill.subject,
          level: skill.level
        },
        create: {
          code: skill.code,
          description: skill.description,
          subject: skill.subject,
          level: skill.level
        }
      })
    }
    console.log(`✅ ${bnccData.length} habilidades BNCC importadas`)
  }

  // 8. Importar Competências BNCC (Gerais e Específicas)
  console.log('⏳ Importando competências BNCC...')
  const compDataPath = path.join(__dirname, 'data', 'bncc-competencies-data.json')
  
  if (fs.existsSync(compDataPath)) {
    const compData = JSON.parse(fs.readFileSync(compDataPath, 'utf8'))
    
    // Gerais
    for (const item of compData.general) {
      await prisma.bnccGeneralCompetency.upsert({
        where: { number: item.number },
        update: { title: item.title, description: item.description },
        create: { number: item.number, title: item.title, description: item.description }
      })
    }
    
    // Específicas
    for (const item of compData.specific) {
      await prisma.bnccSpecificCompetency.upsert({
        where: { code: item.code || `${item.area}-${item.description.slice(0, 20)}` },
        update: { description: item.description, area: item.area },
        create: { code: item.code, description: item.description, area: item.area }
      })
    }
    console.log(`✅ ${compData.general.length} competências gerais e ${compData.specific.length} específicas importadas`)
  }

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

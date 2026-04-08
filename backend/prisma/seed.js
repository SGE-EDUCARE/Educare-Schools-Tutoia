const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando DB Seed no SQLite...');

  const password_hash = await bcrypt.hash('123456', 10);

  // 1. Criar Administradores
  const admin = await prisma.user.upsert({
    where: { email: 'admin@educare.com' },
    update: {},
    create: {
      name: 'Diretor Educare',
      email: 'admin@educare.com',
      password_hash,
      role: 'DIRECTOR',
    },
  });

  // 2. Criar Professor
  const teacher = await prisma.user.upsert({
    where: { email: 'professor@educare.com' },
    update: {},
    create: {
      name: 'Professor João',
      email: 'professor@educare.com',
      password_hash,
      role: 'TEACHER',
    },
  });

  // 3. Criar Pais
  const parent = await prisma.user.upsert({
    where: { email: 'pais@educare.com' },
    update: {},
    create: {
      name: 'Pai do Aluno',
      email: 'pais@educare.com',
      password_hash,
      role: 'PARENT',
    },
  });

  console.log('✅ Usuários base criados');

  // 4. Criar Turmas (Exemplos)
  const class1 = await prisma.class.create({
    data: {
      name: 'Turma A',
      education_level: 'FUNDAMENTAL_I',
      grade_name: '1º Ano'
    }
  });

  // 5. Criar Aluno vinculado a Turma e Pais
  const student = await prisma.student.create({
    data: {
      name: 'Joãozinho',
      registration_id: 'RA0001',
      education_level: 'FUNDAMENTAL_I',
      grade_name: '1º Ano',
      class_id: class1.id,
      parent_id: parent.id
    }
  });

  // 6. Criar Plano de aula falso para o professor para teste no front
  const plan = await prisma.lessonPlan.create({
    data: {
      date: new Date(),
      content: 'Apresentação da matéria e regras de classe.',
      status: 'PENDING',
      type: 'DAILY',
      teacher_id: teacher.id,
      class_id: class1.id
    }
  });

  console.log('✅ Turmas, Planos e Alunos criados com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- INICIANDO VERIFICAÇÃO DE DADOS ---');
  
  const count = await prisma.grade.count();
  console.log('TOTAL DE REGISTROS NA TABELA GRADE:', count);

  const samples = await prisma.grade.findMany({
    take: 10,
    orderBy: { id: 'desc' },
    include: { 
      student: { 
        select: { 
          name: true, 
          class_id: true 
        } 
      } 
    }
  });

  console.log('\nÚLTIMOS 10 REGISTROS SALVOS:');
  console.log(JSON.stringify(samples, null, 2));

  // Verificar especificamente se existem notas para a turma do print se soubermos o ID, 
  // mas vamos ver os samples primeiro.
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

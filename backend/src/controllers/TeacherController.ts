import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class TeacherController {
  // Listar turmas do professor
  static async getClasses(req: AuthRequest, res: Response) {
    const teacher_id = req.user?.id;
    if (!teacher_id) return res.status(401).json({ message: 'Professor não identificado' });

    try {
      const allocations = await prisma.teacherAllocation.findMany({
        where: { teacher_id },
        include: {
          class: {
            include: {
              grade: {
                include: { level: true }
              },
              turn: true,
              _count: { select: { students: true } }
            }
          }
        }
      }) as any[];
      
      res.json(allocations.map(a => ({
        ...(a.class || {}),
        subject: a.subject
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Listar alunos de uma turma
  static async getStudentsByClass(req: AuthRequest, res: Response) {
    const { classId } = req.params;
    try {
      const students = await prisma.student.findMany({
        where: { class_id: String(classId) },
        orderBy: { name: 'asc' }
      });
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lançar Frequência
  static async launchAttendance(req: AuthRequest, res: Response) {
    const { classId, date, attendances } = req.body; // attendances: { studentId: boolean }
    try {
      const operations = Object.entries(attendances).map(([studentId, present]) => {
        return prisma.attendance.upsert({
          where: {
            // Como não temos um índice único composto de (date, student_id, class_id) no schema,
            // vamos fazer uma busca antes ou usar um ID específico se soubermos.
            // Para simplificar agora, vamos usar createMany ou deletar e criar.
            id: `${date}-${studentId}` // Simulando um ID determinístico se suportado, mas o ideal é busca.
          },
          update: { present: !!present },
          create: {
            id: `${date}-${studentId}`,
            date: new Date(date),
            present: !!present,
            student_id: studentId,
            class_id: classId
          }
        });
      });

      // Nota: O schema atual do Attendance não tem ID determinístico. 
      // Vou ajustar a abordagem para buscar e deletar/criar se necessário ou apenas criar.
      // Re-implementando de forma segura:
      
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      for (const [studentId, present] of Object.entries(attendances)) {
        const existing = await prisma.attendance.findFirst({
          where: {
            student_id: studentId,
            class_id: classId,
            date: {
              gte: attendanceDate,
              lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        });

        if (existing) {
          await prisma.attendance.update({
            where: { id: existing.id },
            data: { present: !!present }
          });
        } else {
          await prisma.attendance.create({
            data: {
              date: attendanceDate,
              present: !!present,
              student_id: studentId,
              class_id: classId
            }
          });
        }
      }

      res.json({ message: 'Frequência lançada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lançar Notas (Individual ou por Aluno Master-Detail)
  static async launchGrades(req: AuthRequest, res: Response) {
    const { bimester, subject, label, grades } = req.body;
    const normalizedSubject = String(subject).trim();
    try {
      // Se for o novo formato Master-Detail vindo de salvamento individual por aluno
      if (req.body.studentId) {
        const { studentId, grades: studentGrades } = req.body;
        const labelsMap: any = { p1: '1ª Prova', p2: '2ª Prova', result: 'Média', retry: 'Superação', final: 'Resultado Final' };
        
        for (const [key, value] of Object.entries(studentGrades)) {
          if (value === '' || value === null) continue;
          const labelName = labelsMap[key] || key;
          const numericValue = Number(String(value).replace(',', '.'));
          
          const existing = await prisma.grade.findFirst({
            where: {
              student_id: studentId,
              bimester: Number(bimester),
              subject: normalizedSubject,
              label: labelName
            }
          });

          if (existing) {
            await prisma.grade.update({
              where: { id: existing.id },
              data: { value: numericValue }
            });
          } else {
            await prisma.grade.create({
              data: {
                student_id: studentId,
                bimester: Number(bimester),
                subject: normalizedSubject,
                label: labelName,
                value: numericValue
              }
            });
          }
        }
      } else {
        // Formato legado (compatibilidade)
        const legacySubject = String(subject).trim();
        const legacyLabel = String(label).trim();
        for (const [studentId, value] of Object.entries(grades)) {
          const existing = await prisma.grade.findFirst({
            where: { student_id: studentId, bimester: Number(bimester), subject: legacySubject, label: legacyLabel }
          });

          if (existing) {
            await prisma.grade.update({ where: { id: existing.id }, data: { value: Number(value) } });
          } else {
            await prisma.grade.create({
              data: { student_id: studentId, bimester: Number(bimester), subject: legacySubject, label: legacyLabel, value: Number(value) }
            });
          }
        }
      }
      res.json({ message: 'Notas salvas com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar Notas de uma Turma/Disciplina/Bimestre
  static async getGradesByClass(req: AuthRequest, res: Response) {
    const { classId } = req.params;
    const { bimester, subject } = req.query;

    if (!bimester || !subject) return res.status(400).json({ message: 'Bimestre e disciplina são obrigatórios' });

    const normalizedSubject = String(subject).trim();
    const classIdStr = String(classId);

    try {
      const grades = await prisma.grade.findMany({
        where: {
          student: { class_id: classIdStr },
          bimester: Number(bimester),
          subject: normalizedSubject
        }
      });
      res.json(grades);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lançamento em Massa (Todos os alunos da tela)
  static async bulkLaunchGrades(req: AuthRequest, res: Response) {
    const { bimester, subject, grades, classId } = req.body;
    const normalizedSubject = String(subject).trim();
    try {
      const labelsMap: any = { p1: '1ª Prova', p2: '2ª Prova', result: 'Média', retry: 'Superação', final: 'Resultado Final' };

      for (const [studentId, studentGrades] of Object.entries(grades)) {
        const sGrades = studentGrades as any;
        for (const [key, value] of Object.entries(sGrades)) {
          if (value === '' || value === null) continue;
          const labelName = labelsMap[key] || key;
          const numericValue = Number(String(value).replace(',', '.'));

          const existing = await prisma.grade.findFirst({
            where: {
              student_id: studentId,
              bimester: Number(bimester),
              subject: normalizedSubject,
              label: labelName
            }
          });

          if (existing) {
            await prisma.grade.update({
              where: { id: existing.id },
              data: { value: numericValue }
            });
          } else {
            await prisma.grade.create({
              data: {
                student_id: studentId,
                bimester: Number(bimester),
                subject: normalizedSubject,
                label: labelName,
                value: numericValue
              }
            });
          }
        }
      }
      res.json({ message: 'Lançamento em massa concluído' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  static async getTeacherAllocations(req: AuthRequest, res: Response) {
    const teacher_id = req.user?.id;
    const { classId } = req.params;
    
    if (!teacher_id) return res.status(401).json({ message: 'Não autorizado' });

    try {
      const where: any = { teacher_id };
      if (classId) where.class_id = classId;

      const allocations = await prisma.teacherAllocation.findMany({
        where,
        distinct: ['subject'],
        select: { subject: true }
      });
      res.json(allocations.map(a => a.subject).filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Rotina Diária (Infantil)
  static async launchDailyRoutine(req: AuthRequest, res: Response) {
    const teacher_id = req.user?.id;
    const { date, routines } = req.body; // routines: { studentId: { food, sleep, hygiene, obs } }
    try {
      const routineDate = new Date(date);
      routineDate.setHours(0, 0, 0, 0);

      for (const [studentId, data] of Object.entries(routines)) {
        const routineData = data as any;
        const existing = await prisma.dailyRoutine.findFirst({
          where: {
            student_id: studentId,
            date: {
              gte: routineDate,
              lt: new Date(routineDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        });

        if (existing) {
          await prisma.dailyRoutine.update({
            where: { id: existing.id },
            data: {
              food: routineData.food,
              sleep: !!routineData.sleep,
              hygiene: routineData.hygiene,
              obs: routineData.obs
            }
          });
        } else {
          await prisma.dailyRoutine.create({
            data: {
              date: routineDate,
              food: routineData.food,
              sleep: !!routineData.sleep,
              hygiene: routineData.hygiene,
              obs: routineData.obs,
              student_id: studentId,
              teacher_id: teacher_id!
            }
          });
        }
      }
      res.json({ message: 'Rotina registrada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Agenda de Aula
  static async launchHomework(req: AuthRequest, res: Response) {
    const { classId, title, description, dueDate } = req.body;
    try {
      const homework = await prisma.homework.create({
        data: {
          title,
          description,
          due_date: new Date(dueDate),
          class_id: classId
        }
      });
      res.json(homework);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Comunicados
  static async createNotice(req: AuthRequest, res: Response) {
    const { title, content, targetRole, classId } = req.body;
    try {
      const notice = await prisma.notice.create({
        data: {
          title,
          content,
          target_role: targetRole || 'PARENT',
          class_id: classId
        }
      });
      res.json(notice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Planos de Aula
  static async createLessonPlan(req: AuthRequest, res: Response) {
    const teacher_id = req.user?.id;
    const { 
      id, date, subject, bimester, month, type, classId,
      general_competencies, specific_competencies, knowledge_objects,
      programmatic_content, skills, methodology, evaluation, resources, references,
      content 
    } = req.body;

    try {
      const data: any = {
        date: new Date(date),
        subject,
        bimester: bimester ? Number(bimester) : null,
        month,
        type: type || 'Mensal',
        general_competencies,
        specific_competencies,
        knowledge_objects,
        programmatic_content,
        skills,
        methodology,
        evaluation,
        resources,
        references,
        content,
        class_id: classId,
        teacher_id: teacher_id!
      };

      if (id) {
        const plan = await prisma.lessonPlan.update({
          where: { id },
          data
        });
        res.json(plan);
      } else {
        const plan = await prisma.lessonPlan.create({ data });
        res.json(plan);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Listar Planos de Aula por Turma
  static async getLessonPlansByClass(req: AuthRequest, res: Response) {
    const { classId } = req.params;
    const teacher_id = req.user?.id;

    try {
      const plans = await prisma.lessonPlan.findMany({
        where: { 
          class_id: String(classId), 
          teacher_id: teacher_id! 
        },
        orderBy: { date: 'desc' }
      });
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeacherController {
  // Listar turmas do professor
  static async getClasses(req: Request, res: Response) {
    const teacher_id = req.user?.id;
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
      });
      res.json(allocations.map(a => ({
        ...a.class,
        subject: a.subject
      })));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Listar alunos de uma turma
  static async getStudentsByClass(req: Request, res: Response) {
    const { classId } = req.params;
    try {
      const students = await prisma.student.findMany({
        where: { class_id: classId },
        orderBy: { name: 'asc' }
      });
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lançar Frequência
  static async launchAttendance(req: Request, res: Response) {
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

  // Lançar Notas
  static async launchGrades(req: Request, res: Response) {
    const { bimester, subject, label, grades } = req.body; // grades: { studentId: value }
    try {
      for (const [studentId, value] of Object.entries(grades)) {
        const existing = await prisma.grade.findFirst({
          where: {
            student_id: studentId,
            bimester: Number(bimester),
            subject,
            label
          }
        });

        if (existing) {
          await prisma.grade.update({
            where: { id: existing.id },
            data: { value: Number(value) }
          });
        } else {
          await prisma.grade.create({
            data: {
              student_id: studentId,
              bimester: Number(bimester),
              subject,
              label,
              value: Number(value)
            }
          });
        }
      }
      res.json({ message: 'Notas lançadas com sucesso' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Rotina Diária (Infantil)
  static async launchDailyRoutine(req: Request, res: Response) {
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
  static async launchHomework(req: Request, res: Response) {
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
  static async createNotice(req: Request, res: Response) {
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
  static async createLessonPlan(req: Request, res: Response) {
    const teacher_id = req.user?.id;
    const { date, content, type, classId } = req.body;
    try {
      const plan = await prisma.lessonPlan.create({
        data: {
          date: new Date(date),
          content,
          type,
          class_id: classId,
          teacher_id: teacher_id!
        }
      });
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

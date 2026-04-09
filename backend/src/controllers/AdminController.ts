import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: {
          include: {
            grade: {
              include: {
                level: true
              }
            },
            turn: true
          }
        },
      }
    })
    res.json(students)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' })
  }
}

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
      },
      include: {
        lesson_plans: true,
      }
    })
    res.json(teachers)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores' })
  }
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.student.count()
    const activeTeachers = await prisma.user.count({ where: { role: 'TEACHER', active: true } })
    const pendingPlans = await prisma.lessonPlan.count({ where: { status: 'PENDING' } })
    
    res.json({
      totalStudents,
      activeTeachers,
      pendingPlans,
      dropoutRate: 1.2 // Mock, requer modelagem complexa futura.
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
}

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { 
      name, registration_id, education_level, grade_name, class_id, parent_id,
      address, phone, document, birth_date, naturalness, cpf, nis,
      father_name, mother_name, scholarship
    } = req.body

    const student = await prisma.student.create({
      data: {
        name,
        registration_id,
        education_level,
        grade_name,
        class_id,
        parent_id,
        address,
        phone,
        document,
        birth_date,
        naturalness,
        cpf,
        nis,
        father_name,
        mother_name,
        scholarship: scholarship || false,
      },
    })
    res.status(201).json(student)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este RA já está cadastrado no sistema.' })
    }
    console.error(error)
    res.status(500).json({ error: 'Erro ao cadastrar aluno' })
  }
}

export const getClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany()
    res.json(classes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' })
  }
}

export const getParents = async (req: Request, res: Response) => {
  try {
    const parents = await prisma.user.findMany({
      where: { role: 'PARENT' },
      select: { id: true, name: true, email: true }
    })
    res.json(parents)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar responsáveis' })
  }
}

export const getNextRa = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear()
    const prefix = `RA${year}`
    
    // Busca o maior RA do ano atual
    const lastStudent = await prisma.student.findFirst({
      where: {
        registration_id: {
          startsWith: prefix
        }
      },
      orderBy: {
        registration_id: 'desc'
      }
    })

    let nextNumber = 1
    if (lastStudent) {
      const lastNumberStr = lastStudent.registration_id.replace(prefix, '')
      nextNumber = parseInt(lastNumberStr) + 1
    }

    const nextRa = `${prefix}${nextNumber.toString().padStart(4, '0')}`
    res.json({ nextRa })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar RA' })
  }
}

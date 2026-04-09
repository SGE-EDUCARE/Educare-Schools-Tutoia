import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

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

export const getStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Busca o aluno permitindo falha graciosa caso ID não seja UUID
    const student = await prisma.student.findFirst({
      where: { id: String(id) },
      include: {
        class: {
          include: {
            grade: {
              include: {
                level: true
              }
            }
          }
        },
        parent: { select: { id: true, name: true, email: true } }
      }
    })

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado ou ID inválido' })
    }

    res.json(student)
  } catch (error) {
    console.error(`Erro ao buscar aluno com ID ${req.params.id}:`, error)
    res.status(500).json({ error: 'Erro interno ao buscar aluno' })
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
        allocations: {
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
            }
          }
        }
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
      father_name, mother_name, scholarship, photo_url
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
        photo_url
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

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const data = req.body

    const updated = await prisma.student.update({
      where: { id: String(id) },
      data: {
        ...data,
        updated_at: undefined // Remover campos que não fazem parte do schema se existirem no body
      }
    })
    res.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
    res.status(500).json({ error: 'Erro ao atualizar aluno' })
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

export const admitTeacher = async (req: Request, res: Response) => {
  try {
    const { name, email, password, allocations } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
    }

    const password_hash = await bcrypt.hash(password, 10)

    // Usamos transação para garantir que o professor e suas alocações sejam criados juntos
    const teacher = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          role: 'TEACHER',
          must_reset_password: true
        }
      })

      if (allocations && allocations.length > 0) {
        await tx.teacherAllocation.createMany({
          data: allocations.map((a: any) => ({
            teacher_id: newUser.id,
            class_id: a.class_id,
            subject: a.subject || null
          }))
        })
      }

      return newUser
    })

    res.status(201).json(teacher)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' })
    }
    console.error('Erro ao admitir professor:', error)
    res.status(500).json({ error: 'Falha ao admitir professor' })
  }
}

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.student.delete({
      where: { id: String(id) }
    })
    res.json({ message: 'Estudante excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir aluno:', error)
    res.status(500).json({ error: 'Erro ao excluir aluno. Verifique se existem registros vinculados.' })
  }
}

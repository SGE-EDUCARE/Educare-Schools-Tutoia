import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// --- NÍVEIS DE ENSINO ---
export const getLevels = async (req: Request, res: Response) => {
  try {
    const levels = await prisma.academicLevel.findMany({ include: { grades: true } })
    res.json(levels)
  } catch (error) {
    console.error('Erro ao buscar níveis:', error)
    res.status(500).json({ error: 'Erro ao buscar níveis' })
  }
}

export const createLevel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const level = await prisma.academicLevel.create({ data: { name } })
    res.status(201).json(level)
  } catch (error: any) {
    console.error('Erro ao criar nível:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este nível de ensino já existe.' })
    }
    res.status(500).json({ error: 'Erro ao criar nível' })
  }
}

export const deleteLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.academicLevel.delete({ where: { id: String(id) } })
    res.json({ message: 'Nível removido com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover nível. Verifique se existem séries vinculadas.' })
  }
}

// --- SÉRIES / ANOS ---
export const getGrades = async (req: Request, res: Response) => {
  try {
    const grades = await prisma.academicGrade.findMany({ include: { level: true } })
    res.json(grades)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar séries' })
  }
}

export const createGrade = async (req: Request, res: Response) => {
  try {
    const { name, level_id } = req.body
    const grade = await prisma.academicGrade.create({ data: { name, level_id } })
    res.status(201).json(grade)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar série' })
  }
}

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.academicGrade.delete({ where: { id: String(id) } })
    res.json({ message: 'Série removida com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover série. Verifique se existem turmas vinculadas.' })
  }
}

// --- TURNOS ---
export const getTurns = async (req: Request, res: Response) => {
  try {
    const turns = await prisma.academicTurn.findMany()
    res.json(turns)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turnos' })
  }
}

export const createTurn = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const turn = await prisma.academicTurn.create({ data: { name } })
    res.status(201).json(turn)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar turno' })
  }
}

export const deleteTurn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.academicTurn.delete({ where: { id: String(id) } })
    res.json({ message: 'Turno removido com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover turno.' })
  }
}

// --- TURMAS ---
export const getClassesFull = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        grade: { include: { level: true } },
        turn: true
      }
    })
    res.json(classes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' })
  }
}

export const createClassFull = async (req: Request, res: Response) => {
  try {
    const { name, grade_id, turn_id } = req.body
    const newClass = await prisma.class.create({
      data: { name, grade_id, turn_id }
    })
    res.status(201).json(newClass)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar turma' })
  }
}

export const deleteClassFull = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.class.delete({ where: { id: String(id) } })
    res.json({ message: 'Turma removida com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover turma.' })
  }
}


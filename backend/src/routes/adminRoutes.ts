import { Router } from 'express'
import { 
  getStudents,
  getStudent,
  updateStudent,
  getTeachers, 
  getStats, 
  createStudent, 
  getClasses, 
  getParents,
  getNextRa,
  admitTeacher,
  deleteStudent,
  getPerformanceData
} from '../controllers/AdminController'
import {
  getLevels,
  createLevel,
  getGrades,
  createGrade,
  getTurns,
  createTurn,
  getClassesFull,
  createClassFull,
  deleteLevel,
  deleteGrade,
  deleteTurn,
  deleteClassFull
} from '../controllers/AcademicController'

const router = Router()

// Alunos
router.get('/students', getStudents)
router.get('/students/:id', getStudent)
router.post('/students', createStudent)
router.put('/students/:id', updateStudent)
router.delete('/students/:id', deleteStudent)
router.get('/next-ra', getNextRa)

// Professores
router.get('/teachers', getTeachers)
router.post('/teachers', admitTeacher)

// Estatísticas e Performance
router.get('/stats', getStats)
router.get('/performance', getPerformanceData)

// Dados para formulários
router.get('/parents', getParents)

// Gestão Acadêmica Dinâmica
router.get('/academic/levels', getLevels)
router.post('/academic/levels', createLevel)
router.delete('/academic/levels/:id', deleteLevel)

router.get('/academic/grades', getGrades)
router.post('/academic/grades', createGrade)
router.delete('/academic/grades/:id', deleteGrade)

router.get('/academic/turns', getTurns)
router.post('/academic/turns', createTurn)
router.delete('/academic/turns/:id', deleteTurn)

router.get('/academic/classes', getClassesFull)
router.post('/academic/classes', createClassFull)
router.delete('/academic/classes/:id', deleteClassFull)

export default router

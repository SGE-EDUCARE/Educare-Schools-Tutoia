import { Router } from 'express';
import { TeacherController } from '../controllers/TeacherController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de professor exigem autenticação
router.use(authenticateToken);

router.get('/classes', TeacherController.getClasses);
router.get('/classes/:classId/allocations', TeacherController.getTeacherAllocations);
router.get('/classes/:classId/students', TeacherController.getStudentsByClass);
router.get('/classes/:classId/grades', TeacherController.getGradesByClass);

router.post('/grades/bulk', TeacherController.bulkLaunchGrades);
router.post('/grades', TeacherController.launchGrades);
router.post('/routine', TeacherController.launchDailyRoutine);
router.post('/homework', TeacherController.launchHomework);
router.post('/notices', TeacherController.createNotice);
router.post('/lesson-plans', TeacherController.createLessonPlan);

export default router;

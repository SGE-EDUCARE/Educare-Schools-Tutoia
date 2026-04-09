import { Router } from 'express';
import { TeacherController } from '../controllers/TeacherController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas de professor exigem autenticação
router.use(authenticateToken);

router.get('/classes', TeacherController.getClasses);
router.get('/classes/:classId/students', TeacherController.getStudentsByClass);

router.post('/attendance', TeacherController.launchAttendance);
router.post('/grades', TeacherController.launchGrades);
router.post('/routine', TeacherController.launchDailyRoutine);
router.post('/homework', TeacherController.launchHomework);
router.post('/notices', TeacherController.createNotice);
router.post('/lesson-plans', TeacherController.createLessonPlan);

export default router;

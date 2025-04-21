import { Router } from 'express';
import * as UserController from '@/controllers/user.controller';
import * as SkillController from '@/controllers/skill.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', UserController.getStudents);
router.post('/register', UserController.registerStudent);
router.post('/login', UserController.loginStudent);
router.post('/logout', authMiddleware, UserController.logoutStudent);
router.put('/update', authMiddleware, UserController.updateStudent);
router.get('/id/:id', UserController.getStudentById);
router.get('/username/:username', UserController.getStudentByUsername);
router.get('/id/:id/skills', SkillController.getSkillsByStudentId);
export default router;

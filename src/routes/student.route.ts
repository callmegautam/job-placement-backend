import { Router } from 'express';
import * as UserController from '@/controllers/user.controller';
import * as SkillController from '@/controllers/skill.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

//auth
router.post('/register', UserController.registerStudent);
router.post('/login', UserController.loginStudent);
router.post('/logout', authMiddleware, UserController.logoutStudent);

// CRUD
router.get('/', UserController.getStudents);
router.put('/update', authMiddleware, UserController.updateStudent);
router.get('/id/:id', UserController.getStudentById);
router.get('/username/:username', UserController.getStudentByUsername);

//skills
router.get('/id/:id/skills', SkillController.getSkillsByStudentId);
router.post('/skills', authMiddleware, UserController.addSkillsToStudent);

//jobs
router.get('/id/:id/matching-jobs', UserController.getMatchingJobs);
router.post('/apply/:jobId', authMiddleware, UserController.applyToJob);
router.get('/applications', authMiddleware, UserController.getStudentApplications);

export default router;

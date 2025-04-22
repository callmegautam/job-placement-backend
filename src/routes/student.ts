import { Router } from 'express';
import * as UserController from '@/controllers/student';
import * as SkillController from '@/controllers/skill';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// ? crud
router.put('/update', authMiddleware, UserController.updateStudent);

// ? skill
// todo : convert this into auth based not id based
router.get('/id/:id/skills', SkillController.getSkillsByStudentId);
router.post('/skills', authMiddleware, UserController.addSkillsToStudent);

// ? jobs
// todo : convert this into auth based not id based
router.get('/id/:id/matching-jobs', UserController.getMatchingJobs);
router.post('/apply/:jobId', authMiddleware, UserController.applyToJob);

// ? applications
router.get('/applications', authMiddleware, UserController.getStudentApplications);

export default router;

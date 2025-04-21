import { Router } from 'express';
import * as JobController from '@/controllers/job.controller';
import { authMiddlewareWithRole } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);
router.post('/', authMiddlewareWithRole('COMPANY'), JobController.createJob);
router.put('/:id', authMiddlewareWithRole('COMPANY'), JobController.updateJob);
router.delete('/:id', authMiddlewareWithRole('COMPANY'), JobController.deleteJob);

export default router;

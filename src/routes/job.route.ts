import { Router } from 'express';
import * as JobController from '@/controllers/job.controller';

const router = Router();

router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);
router.post('/', JobController.createJob);
router.put('/:id', JobController.updateJob);
router.delete('/:id', JobController.deleteJob);

export default router;

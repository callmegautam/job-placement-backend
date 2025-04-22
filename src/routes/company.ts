import { Router } from 'express';
import * as Company from '@/controllers/company';
import { authMiddleware, authMiddlewareWithRole } from '@/middlewares/auth.middleware';

const router = Router();

// ? company
router.put('/update', authMiddleware, Company.updateCompany);

// ? jobs
router.post('/', authMiddlewareWithRole('COMPANY'), Company.createJob);
router.put('/:id', authMiddlewareWithRole('COMPANY'), Company.updateJob);
router.delete('/:id', authMiddlewareWithRole('COMPANY'), Company.deleteJob);
router.get('/jobs', authMiddleware, Company.getJobs);

// ? applications
router.get('/job/:jobId/applicants', Company.getApplicants);
router.put('/application/:applicationId/status', authMiddleware, Company.updateApplicationStatus);

export default router;

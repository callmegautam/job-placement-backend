import { Router } from 'express';
import * as Company from '@/controllers/company';
import { authMiddleware, authMiddlewareWithRole } from '@/middlewares/auth.middleware';

const router = Router();

// ? company
router.put('/update', authMiddlewareWithRole('COMPANY'), Company.updateCompany);

// ? jobs
router.get('/jobs', authMiddleware, Company.getJobs);
router.post('/jobs', authMiddlewareWithRole('COMPANY'), Company.createJob);
router.put('/jobs/id/:id', authMiddlewareWithRole('COMPANY'), Company.updateJob);
router.delete('/jobs/id/:id', authMiddlewareWithRole('COMPANY'), Company.deleteJob);

// ? applications
router.get('/job/:id/applicants', authMiddlewareWithRole('COMPANY'), Company.getApplicants);
router.put(
    '/application/:applicationId/status',
    authMiddlewareWithRole('COMPANY'),
    Company.updateApplicationStatus
);

export default router;

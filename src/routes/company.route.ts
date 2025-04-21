import { Router } from 'express';
import * as CompanyController from '@/controllers/company.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', CompanyController.getCompanies);
router.post('/register', CompanyController.registerCompany);
router.post('/login', CompanyController.loginCompany);
router.post('/logout', authMiddleware, CompanyController.logoutCompany);
router.get('/id/:id', CompanyController.getCompanyById);
router.put('/update', authMiddleware, CompanyController.updateCompany);
router.get('/job/:jobId/applicants', CompanyController.getApplicants);
router.put('/application/:applicationId/status', authMiddleware, CompanyController.updateApplicationStatus);
router.get('/jobs', CompanyController.getJobs);

export default router;

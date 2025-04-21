import { Router } from 'express';
import * as CompanyController from '@/controllers/company.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/', CompanyController.getCompanies);
router.post('/register', CompanyController.registerCompany);
router.post('/login', CompanyController.loginCompany);
router.post('/logout', authMiddleware, CompanyController.logoutCompany);
router.get('/id/:id', CompanyController.getCompanyById);
router.put('/id/:id', authMiddleware, CompanyController.updateCompany);
export default router;

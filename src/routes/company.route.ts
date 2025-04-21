import { Router } from 'express';
import * as CompanyController from '@/controllers/company.controller';

const router = Router();

router.get('/', CompanyController.getCompanies);
router.post('/register', CompanyController.registerCompany);
router.post('/login', CompanyController.loginCompany);
router.post('/logout', CompanyController.logoutCompany);
router.get('/id/:id', CompanyController.getCompanyById);
router.put('/id/:id', CompanyController.updateCompany);
export default router;

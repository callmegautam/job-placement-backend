import { Router } from 'express';

import * as Auth from '@/controllers/auth';

const router = Router();

// ? student
router.post('/student/register', Auth.registerStudent);
router.post('/student/login', Auth.loginStudent);
router.get('/student/logout', Auth.logoutStudent);

router.post('/company/register', Auth.registerCompany);
router.post('/company/login', Auth.loginCompany);
router.get('/company/logout', Auth.logoutCompany);

export default router;

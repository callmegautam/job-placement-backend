import { Router } from 'express';
import * as UserController from '@/controllers/user.controller';

const router = Router();

router.get('/', UserController.getUsers);
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/logout', UserController.logoutUser);
router.post('/update', UserController.updateUser);
router.get('/:id', UserController.getUserById);
router.get('/:username', UserController.getUserByUsername);
export default router;

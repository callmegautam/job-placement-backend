import { Router } from 'express';
import * as UserController from '@/controllers/user.controller';
import * as SkillController from '@/controllers/skill.controller';

const router = Router();

router.get('/', UserController.getUsers);
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/logout', UserController.logoutUser);
router.put('/update', UserController.updateUser);
router.get('/id/:id', UserController.getUserById);
router.get('/username/:username', UserController.getUserByUsername);
router.get('/students/:id/skills', SkillController.getSkillsById);
export default router;

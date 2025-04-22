import { Router } from 'express';
import * as skill from '@/controllers/skill';

const router = Router();

router.get('/', skill.getSkills);
export default router;

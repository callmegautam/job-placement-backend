import { Router } from 'express';
import * as SkillController from '@/controllers/skill.controller';

const router = Router();

router.get('/', SkillController.getSkills);
export default router;

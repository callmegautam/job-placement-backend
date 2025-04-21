import { Router } from 'express';
import * as SkillController from '@/controllers/skill.controller';

const router = Router();

router.get('/', SkillController.getSkills);
router.post('/:userId', SkillController.getSkillsById);
export default router;

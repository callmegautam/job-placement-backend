import db from '@/db';
import { skillsEnum, student, studentSkill } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

export const getSkills = asyncHandler(async (req: Request, res: Response) => {
    const skills = Array.isArray(skillsEnum.enumValues) ? skillsEnum.enumValues : [];

    if (skills.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No skills found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Skills fetched successfully',
        data: skills,
    });
});

export const getSkillsById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid skill id is required',
            data: null,
        });
    }

    const [user] = await db.select().from(student).where(eq(student.id, id));

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            data: null,
        });
    }

    const skills = await db.select().from(studentSkill).where(eq(studentSkill.studentId, id));

    if (!skills || skills.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Skill not found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Skill fetched successfully',
        data: skills,
    });
});

// import db from '@/db';
// import asyncHandler from '@/utils/asyncHandler';
// import { eq } from 'drizzle-orm';
// import { Request, Response } from 'express';
// import { job, jobSkill, student, studentSkill } from '@/db/schema';

// export const matchingJobs = asyncHandler(async (req: Request, res: Response) => {
//     const userId = Number(req.params?.id);
//     if (!userId || isNaN(userId)) {
//         return res.status(400).json({
//             success: false,
//             message: 'Valid user id is required',
//             data: null,
//         });
//     }

//     const [user] = await db.select().from(student).where(eq(student.id, userId));

//     if (!user) {
//         return res.status(404).json({
//             success: false,
//             message: 'User not found',
//             data: null,
//         });
//     }

//     const studentSkills = await db.select().from(studentSkill).where(eq(studentSkill.studentId, userId));

//     const skillList = studentSkills.map((s) => s.skill);

//     const jobs = await db.select().from(job);

//     if (!jobs || jobs.length === 0) {
//         return res.status(404).json({
//             success: false,
//             message: 'No jobs available',
//             data: null,
//         });
//     }

//     // const matchingJobs = await db
//     //     .selectDistinct({ job: job })
//     //     .from(job)
//     //     .leftJoin(jobSkill, eq(job.id, jobSkill.jobId))
//     //     .where(jobSkill.skill.in(skillList));

//     if (!studentSkills || studentSkills.length === 0) {
//         return res.status(404).json({
//             success: false,
//             message: 'User has no skills',
//             data: null,
//         });
//     }
// });

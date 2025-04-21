import { course } from '@/db/schema';

export type CourseType = (typeof course.enumValues)[number];

import {
    pgTable,
    uniqueIndex,
    serial,
    text,
    boolean,
    timestamp,
    foreignKey,
    integer,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const verificationStatus = pgEnum('VerificationStatus', [
    'PENDING',
    'AUTO_VERIFIED',
    'MANUAL_REVIEW',
    'VERIFIED',
    'REJECTED',
]);

export const company = pgTable(
    'company',
    {
        id: serial().primaryKey().notNull(),
        email: text().notNull(),
        password: text().notNull(),
        companyName: text().notNull(),
        domain: text().notNull(),
        description: text(),
        website: text(),
        address: text(),
        linkedinUrl: text(),
        logoUrl: text(),
        isVerified: boolean().default(false).notNull(),
        verificationStatus: verificationStatus().default('PENDING').notNull(),
        createdAt: timestamp({ precision: 3, mode: 'string' })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    },
    (table) => [
        uniqueIndex('Company_domain_key').using('btree', table.domain.asc().nullsLast().op('text_ops')),
        uniqueIndex('Company_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
    ]
);

export const college = pgTable('college', {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    location: text().notNull(),
});

export const student = pgTable(
    'student',
    {
        id: serial().primaryKey().notNull(),
        email: text().notNull(),
        password: text().notNull(),
        username: text().notNull(),
        name: text().notNull(),
        course: text(),
        admissionYear: integer(),
        currentYear: integer(),
        gradYear: integer(),
        collegeId: integer(),
        githubUrl: text(),
        resumeUrl: text(),
        avatarUrl: text(),
        createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp({ precision: 3, mode: 'string' }),
    },
    (table) => [
        uniqueIndex('Student_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
        uniqueIndex('Student_username_key').using('btree', table.username.asc().nullsLast().op('text_ops')),
        foreignKey({
            columns: [table.collegeId],
            foreignColumns: [college.id],
            name: 'Student_collegeId_fkey',
        })
            .onUpdate('cascade')
            .onDelete('set null'),
    ]
);

export const studentRelations = relations(student, ({ one }) => ({
    college: one(college, {
        fields: [student.collegeId],
        references: [college.id],
    }),
}));

export const collegeRelations = relations(college, ({ many }) => ({
    students: many(student),
}));

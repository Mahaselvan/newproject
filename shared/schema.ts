import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const feedbackModeEnum = pgEnum('feedback_mode', ['baby', 'troll', 'socratic', 'teacher']);
export const explanationTypeEnum = pgEnum('explanation_type', ['text', 'audio', 'video']);
export const subjectEnum = pgEnum('subject', ['mathematics', 'science', 'history', 'physics', 'chemistry', 'biology', 'english', 'geography']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  totalXP: integer("total_xp").default(0),
  level: integer("level").default(1),
  streak: integer("streak").default(0),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: subjectEnum("subject").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  xpReward: integer("xp_reward").default(50),
  estimatedMinutes: integer("estimated_minutes").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const explanations = pgTable("explanations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  type: explanationTypeEnum("type").notNull(),
  content: text("content"), // text content or transcription
  fileUrl: text("file_url"), // for audio/video files
  feedbackMode: feedbackModeEnum("feedback_mode").notNull(),
  score: integer("score"), // 0-100
  aiEvaluation: jsonb("ai_evaluation"), // detailed AI feedback
  xpEarned: integer("xp_earned").default(0),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: jsonb("criteria").notNull(), // conditions to earn badge
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  explanationId: varchar("explanation_id").notNull().references(() => explanations.id),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // daily, weekly, monthly, yearly
  period: text("period").notNull(), // date range identifier
  data: jsonb("data").notNull(), // report metrics and insights
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  explanations: many(explanations),
  userBadges: many(userBadges),
  votes: many(votes),
  reports: many(reports),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  explanations: many(explanations),
}));

export const explanationsRelations = relations(explanations, ({ one, many }) => ({
  user: one(users, {
    fields: [explanations.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [explanations.topicId],
    references: [topics.id],
  }),
  votes: many(votes),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  explanation: one(explanations, {
    fields: [votes.explanationId],
    references: [explanations.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalXP: true,
  level: true,
  streak: true,
  lastActiveDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
});

export const insertExplanationSchema = createInsertSchema(explanations).omit({
  id: true,
  score: true,
  aiEvaluation: true,
  xpEarned: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Explanation = typeof explanations.$inferSelect;
export type InsertExplanation = z.infer<typeof insertExplanationSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Report = typeof reports.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

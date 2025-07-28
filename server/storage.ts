import { users, topics, explanations, badges, userBadges, votes, reports, type User, type InsertUser, type Topic, type InsertTopic, type Explanation, type InsertExplanation, type Badge, type InsertBadge, type UserBadge, type Vote, type InsertVote, type Report } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, avg, sum, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getUserStats(userId: string): Promise<any>;
  getLeaderboard(limit?: number): Promise<any[]>;

  // Topics
  getAllTopics(): Promise<Topic[]>;
  getTopicById(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  getRecommendedTopics(userId: string, limit?: number): Promise<Topic[]>;

  // Explanations
  createExplanation(explanation: InsertExplanation): Promise<Explanation>;
  getExplanation(id: string): Promise<Explanation | undefined>;
  getExplanationsByUser(userId: string, limit?: number): Promise<Explanation[]>;
  updateExplanation(id: string, updates: Partial<Explanation>): Promise<Explanation>;
  getPublicExplanations(limit?: number): Promise<any[]>;
  getUserExplanationsWithTopics(userId: string): Promise<any[]>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<any[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  checkAndAwardBadges(userId: string): Promise<void>;

  // Votes
  voteOnExplanation(vote: InsertVote): Promise<Vote>;
  getUserVote(userId: string, explanationId: string): Promise<Vote | undefined>;
  updateVote(userId: string, explanationId: string, isUpvote: boolean): Promise<Vote>;

  // Reports
  createReport(userId: string, type: string, period: string, data: any): Promise<Report>;
  getRecentReports(userId: string, type?: string): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserStats(userId: string): Promise<any> {
    const [explanationStats] = await db
      .select({
        explanationsCount: count(),
        averageScore: avg(explanations.score),
        totalXPEarned: sum(explanations.xpEarned),
      })
      .from(explanations)
      .where(eq(explanations.userId, userId));

    const badgeCount = await db
      .select({ count: count() })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    return {
      explanationsCount: explanationStats.explanationsCount || 0,
      averageScore: Math.round(Number(explanationStats.averageScore) || 0),
      totalXPEarned: Number(explanationStats.totalXPEarned) || 0,
      badgesCount: badgeCount[0]?.count || 0,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        totalXP: users.totalXP,
        level: users.level,
        streak: users.streak,
      })
      .from(users)
      .orderBy(desc(users.totalXP))
      .limit(limit);
  }

  async getAllTopics(): Promise<Topic[]> {
    return await db.select().from(topics).orderBy(topics.title);
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic || undefined;
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [newTopic] = await db
      .insert(topics)
      .values(topic)
      .returning();
    return newTopic;
  }

  async getRecommendedTopics(userId: string, limit: number = 4): Promise<Topic[]> {
    // Get topics user hasn't explained yet
    const userTopics = await db
      .select({ topicId: explanations.topicId })
      .from(explanations)
      .where(eq(explanations.userId, userId));
    
    const userTopicIds = userTopics.map(t => t.topicId);
    
    return await db
      .select()
      .from(topics)
      .where(userTopicIds.length > 0 ? sql`${topics.id} NOT IN (${userTopicIds.join(',')})` : sql`1=1`)
      .limit(limit);
  }

  async createExplanation(explanation: InsertExplanation): Promise<Explanation> {
    const [newExplanation] = await db
      .insert(explanations)
      .values(explanation)
      .returning();
    return newExplanation;
  }

  async getExplanation(id: string): Promise<Explanation | undefined> {
    const [explanation] = await db.select().from(explanations).where(eq(explanations.id, id));
    return explanation || undefined;
  }

  async getExplanationsByUser(userId: string, limit: number = 10): Promise<Explanation[]> {
    return await db
      .select()
      .from(explanations)
      .where(eq(explanations.userId, userId))
      .orderBy(desc(explanations.createdAt))
      .limit(limit);
  }

  async updateExplanation(id: string, updates: Partial<Explanation>): Promise<Explanation> {
    const [explanation] = await db
      .update(explanations)
      .set(updates)
      .where(eq(explanations.id, id))
      .returning();
    return explanation;
  }

  async getPublicExplanations(limit: number = 20): Promise<any[]> {
    return await db
      .select({
        id: explanations.id,
        type: explanations.type,
        content: explanations.content,
        score: explanations.score,
        upvotes: explanations.upvotes,
        downvotes: explanations.downvotes,
        createdAt: explanations.createdAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          level: users.level,
        },
        topic: {
          id: topics.id,
          title: topics.title,
          subject: topics.subject,
        }
      })
      .from(explanations)
      .innerJoin(users, eq(explanations.userId, users.id))
      .innerJoin(topics, eq(explanations.topicId, topics.id))
      .where(eq(explanations.isPublic, true))
      .orderBy(desc(explanations.score), desc(explanations.createdAt))
      .limit(limit);
  }

  async getUserExplanationsWithTopics(userId: string): Promise<any[]> {
    return await db
      .select({
        id: explanations.id,
        type: explanations.type,
        score: explanations.score,
        xpEarned: explanations.xpEarned,
        createdAt: explanations.createdAt,
        topic: {
          title: topics.title,
          subject: topics.subject,
        }
      })
      .from(explanations)
      .innerJoin(topics, eq(explanations.topicId, topics.id))
      .where(eq(explanations.userId, userId))
      .orderBy(desc(explanations.createdAt))
      .limit(10);
  }

  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return await db
      .select({
        id: userBadges.id,
        earnedAt: userBadges.earnedAt,
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          icon: badges.icon,
          color: badges.color,
        }
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    return userBadge;
  }

  async checkAndAwardBadges(userId: string): Promise<void> {
    // Get user stats
    const stats = await this.getUserStats(userId);
    const allBadges = await this.getAllBadges();
    const userBadgesList = await this.getUserBadges(userId);
    const earnedBadgeIds = userBadgesList.map(ub => ub.badge.id);

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      const criteria = badge.criteria as any;
      let shouldAward = false;

      // Check badge criteria
      if (criteria.explanationsCount && stats.explanationsCount >= criteria.explanationsCount) {
        shouldAward = true;
      }
      if (criteria.averageScore && stats.averageScore >= criteria.averageScore) {
        shouldAward = true;
      }
      if (criteria.streak) {
        const user = await this.getUser(userId);
        if (user && (user.streak || 0) >= criteria.streak) {
          shouldAward = true;
        }
      }

      if (shouldAward) {
        await this.awardBadge(userId, badge.id);
      }
    }
  }

  async voteOnExplanation(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db
      .insert(votes)
      .values(vote)
      .returning();

    // Update explanation vote counts
    await this.updateExplanationVotes(vote.explanationId);
    
    return newVote;
  }

  async getUserVote(userId: string, explanationId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.explanationId, explanationId)));
    return vote || undefined;
  }

  async updateVote(userId: string, explanationId: string, isUpvote: boolean): Promise<Vote> {
    const [vote] = await db
      .update(votes)
      .set({ isUpvote })
      .where(and(eq(votes.userId, userId), eq(votes.explanationId, explanationId)))
      .returning();

    // Update explanation vote counts
    await this.updateExplanationVotes(explanationId);
    
    return vote;
  }

  private async updateExplanationVotes(explanationId: string): Promise<void> {
    const voteCounts = await db
      .select({
        upvotes: sum(sql`CASE WHEN ${votes.isUpvote} THEN 1 ELSE 0 END`),
        downvotes: sum(sql`CASE WHEN NOT ${votes.isUpvote} THEN 1 ELSE 0 END`),
      })
      .from(votes)
      .where(eq(votes.explanationId, explanationId));

    await db
      .update(explanations)
      .set({
        upvotes: Number(voteCounts[0]?.upvotes) || 0,
        downvotes: Number(voteCounts[0]?.downvotes) || 0,
      })
      .where(eq(explanations.id, explanationId));
  }

  async createReport(userId: string, type: string, period: string, data: any): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values({ userId, type, period, data })
      .returning();
    return report;
  }

  async getRecentReports(userId: string, type?: string): Promise<Report[]> {
    const whereClause = type 
      ? and(eq(reports.userId, userId), eq(reports.type, type))
      : eq(reports.userId, userId);

    return await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.createdAt))
      .limit(10);
  }

  async updateReport(reportId: string, updates: Partial<Report>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, reportId))
      .returning();
    return report;
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db
      .insert(badges)
      .values(badge)
      .returning();
    return newBadge;
  }
}

export const storage = new DatabaseStorage();

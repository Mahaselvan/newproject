import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertExplanationSchema, insertVoteSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { evaluateExplanation, transcribeAudio, generateReportInsights } from "./services/openai";
// SendGrid disabled as requested

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          totalXP: user.totalXP,
          level: user.level,
          streak: user.streak,
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last active date and check streak
      const today = new Date();
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      let streak = user.streak || 0;

      if (lastActive) {
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          streak += 1;
        } else if (daysDiff > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }

      const updatedUser = await storage.updateUser(user.id, {
        lastActiveDate: today,
        streak: streak,
      });

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          totalXP: updatedUser.totalXP,
          level: updatedUser.level,
          streak: updatedUser.streak,
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // User routes
  app.get('/api/user/profile', authenticateToken, async (req: any, res, next) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const stats = await storage.getUserStats(req.user.userId);
      const badges = await storage.getUserBadges(req.user.userId);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          totalXP: user.totalXP,
          level: user.level,
          streak: user.streak,
        },
        stats,
        badges: badges.slice(0, 3), // Latest 3 badges
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/user/stats', authenticateToken, async (req: any, res, next) => {
    try {
      const stats = await storage.getUserStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/user/recent-activity', authenticateToken, async (req: any, res, next) => {
    try {
      const activity = await storage.getUserExplanationsWithTopics(req.user.userId);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });

  // Topics routes
  app.get('/api/topics', authenticateToken, async (req, res, next) => {
    try {
      const topics = await storage.getAllTopics();
      res.json(topics);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/topics/recommended', authenticateToken, async (req: any, res, next) => {
    try {
      const topics = await storage.getRecommendedTopics(req.user.userId, 4);
      res.json(topics);
    } catch (error) {
      next(error);
    }
  });

  // Explanations routes
  app.post('/api/explanations', authenticateToken, upload.single('file'), async (req: any, res, next) => {
    try {
      const explanationData = {
        ...req.body,
        userId: req.user.userId,
      };

      let content = explanationData.content;
      let fileUrl = null;

      // Handle audio/video files
      if (req.file && explanationData.type !== 'text') {
        // For demo purposes, we'll use a placeholder URL
        // In production, you'd upload to cloud storage
        fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;

        // Transcribe audio if it's an audio explanation
        if (explanationData.type === 'audio') {
          try {
            const transcription = await transcribeAudio(req.file.buffer);
            content = transcription.text;
          } catch (error) {
            console.error('Transcription failed:', error);
            return res.status(400).json({ message: 'Failed to transcribe audio' });
          }
        }
      }

      if (!content || content.trim().length < 50) {
        return res.status(400).json({ message: 'Explanation must be at least 50 characters long' });
      }

      // Get topic details
      const topic = await storage.getTopicById(explanationData.topicId);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      // Evaluate with AI (fallback to mock evaluation if API key not available)
      let evaluation;
      try {
        if (process.env.OPENAI_API_KEY) {
          evaluation = await evaluateExplanation(
            content,
            topic.title,
            explanationData.feedbackMode
          );
        } else {
          // Mock evaluation for development
          evaluation = {
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            feedback: `Great explanation! You've covered the key points about ${topic.title}. Keep practicing to improve even more.`,
            strengths: ['Clear explanation', 'Good examples', 'Proper structure'],
            improvements: ['Add more detail', 'Include practical examples'],
          };
        }
      } catch (error) {
        console.error('AI evaluation failed, using fallback:', error);
        // Fallback evaluation
        evaluation = {
          score: Math.floor(Math.random() * 30) + 70,
          feedback: `Thank you for your explanation about ${topic.title}. Your effort in learning by teaching is commendable!`,
          strengths: ['Thoughtful explanation', 'Good effort'],
          improvements: ['Continue practicing'],
        };
      }

      // Calculate XP earned based on score and topic difficulty
      const baseXP = topic.xpReward || 50;
      const scoreMultiplier = evaluation.score / 100;
      const xpEarned = Math.round(baseXP * scoreMultiplier);

      // Create explanation
      const explanation = await storage.createExplanation({
        userId: req.user.userId,
        topicId: explanationData.topicId,
        type: explanationData.type,
        content,
        fileUrl,
        feedbackMode: explanationData.feedbackMode,
        score: evaluation.score,
        aiEvaluation: evaluation,
        xpEarned,
        isPublic: explanationData.isPublic !== false,
      });

      // Update user XP and level
      const user = await storage.getUser(req.user.userId);
      if (user) {
        const newTotalXP = (user.totalXP || 0) + xpEarned;
        const newLevel = Math.floor(newTotalXP / 1000) + 1; // 1000 XP per level

        await storage.updateUser(req.user.userId, {
          totalXP: newTotalXP,
          level: newLevel,
        });

        // Check and award badges
        await storage.checkAndAwardBadges(req.user.userId);
      }

      res.status(201).json({
        message: 'Explanation submitted successfully',
        explanation,
        evaluation,
        xpEarned,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/explanations/public', authenticateToken, async (req, res, next) => {
    try {
      const explanations = await storage.getPublicExplanations(20);
      res.json(explanations);
    } catch (error) {
      next(error);
    }
  });

  // Voting routes
  app.post('/api/explanations/:id/vote', authenticateToken, async (req: any, res, next) => {
    try {
      const { id } = req.params;
      const { isUpvote } = req.body;

      const explanation = await storage.getExplanation(id);
      if (!explanation) {
        return res.status(404).json({ message: 'Explanation not found' });
      }

      // Check if user already voted
      const existingVote = await storage.getUserVote(req.user.userId, id);
      
      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          return res.status(400).json({ message: 'You have already voted this way' });
        }
        // Update existing vote
        await storage.updateVote(req.user.userId, id, isUpvote);
      } else {
        // Create new vote
        await storage.voteOnExplanation({
          userId: req.user.userId,
          explanationId: id,
          isUpvote,
        });
      }

      res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
      next(error);
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', authenticateToken, async (req, res, next) => {
    try {
      const leaderboard = await storage.getLeaderboard(50);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  });

  // Badges routes
  app.get('/api/badges', authenticateToken, async (req, res, next) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/user/badges', authenticateToken, async (req: any, res, next) => {
    try {
      const badges = await storage.getUserBadges(req.user.userId);
      res.json(badges);
    } catch (error) {
      next(error);
    }
  });

  // Reports routes
  app.get('/api/reports', authenticateToken, async (req: any, res, next) => {
    try {
      const { type } = req.query;
      const reports = await storage.getRecentReports(req.user.userId, type as string);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/reports/generate', authenticateToken, async (req: any, res, next) => {
    try {
      const { type = 'weekly', period } = req.body;
      
      // Get user data for report
      const user = await storage.getUser(req.user.userId);
      const stats = await storage.getUserStats(req.user.userId);
      const recentActivity = await storage.getUserExplanationsWithTopics(req.user.userId);
      const badges = await storage.getUserBadges(req.user.userId);

      const reportData = {
        user: user,
        stats: stats,
        recentActivity: recentActivity,
        badges: badges,
        period: period || new Date().toISOString().split('T')[0],
      };

      // Generate AI insights
      let insights = '';
      try {
        insights = await generateReportInsights(reportData);
      } catch (error) {
        console.error('Failed to generate insights:', error);
        insights = 'Unable to generate insights at this time.';
      }

      const report = await storage.createReport(
        req.user.userId,
        type,
        reportData.period,
        { ...reportData, insights }
      );

      // Email functionality disabled as requested
      console.log('Email report generated for user:', user?.email);

      res.json({
        message: 'Report generated successfully',
        report: {
          ...report,
          data: { ...report.data, insights }
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // Initialize default topics and badges
  app.post('/api/admin/seed', async (req, res, next) => {
    try {
      // Create default topics
      const defaultTopics = [
        {
          title: "Photosynthesis Process",
          description: "Explain how plants convert sunlight into energy through photosynthesis",
          subject: "biology" as const,
          difficulty: "medium",
          xpReward: 75,
          estimatedMinutes: 5,
        },
        {
          title: "Quadratic Equations",
          description: "Teach the quadratic formula and how to solve quadratic equations",
          subject: "mathematics" as const,
          difficulty: "medium",
          xpReward: 80,
          estimatedMinutes: 6,
        },
        {
          title: "Newton's Laws of Motion",
          description: "Explain the three fundamental laws of classical mechanics",
          subject: "physics" as const,
          difficulty: "medium",
          xpReward: 75,
          estimatedMinutes: 5,
        },
        {
          title: "World War II Causes",
          description: "Explain the key factors that led to World War II",
          subject: "history" as const,
          difficulty: "easy",
          xpReward: 55,
          estimatedMinutes: 4,
        },
        {
          title: "Chemical Bonding",
          description: "Describe how atoms form ionic and covalent bonds",
          subject: "chemistry" as const,
          difficulty: "easy",
          xpReward: 60,
          estimatedMinutes: 3,
        },
        {
          title: "Calculus Integration",
          description: "Teach the fundamental theorem of calculus and integration techniques",
          subject: "mathematics" as const,
          difficulty: "hard",
          xpReward: 90,
          estimatedMinutes: 8,
        },
      ];

      for (const topic of defaultTopics) {
        try {
          await storage.createTopic(topic);
        } catch (error) {
          // Topic might already exist, continue
        }
      }

      // Create default badges
      const defaultBadges = [
        {
          name: "First Steps",
          description: "Complete your first explanation",
          icon: "fas fa-baby",
          color: "pink",
          criteria: { explanationsCount: 1 },
        },
        {
          name: "Science Specialist",
          description: "Complete 10 science explanations",
          icon: "fas fa-flask",
          color: "green",
          criteria: { explanationsCount: 10, subject: "science" },
        },
        {
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: "fas fa-fire",
          color: "red",
          criteria: { streak: 7 },
        },
        {
          name: "Top Scorer",
          description: "Achieve 90+ average score",
          icon: "fas fa-star",
          color: "yellow",
          criteria: { averageScore: 90 },
        },
        {
          name: "Prolific Teacher",
          description: "Complete 50 explanations",
          icon: "fas fa-chalkboard-teacher",
          color: "blue",
          criteria: { explanationsCount: 50 },
        },
      ];

      for (const badge of defaultBadges) {
        try {
          await storage.createBadge(badge);
        } catch (error) {
          // Badge might already exist, continue
        }
      }

      res.json({ message: 'Database seeded successfully' });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

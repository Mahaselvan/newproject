import { storage } from "./storage";

export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
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
      {
        title: "DNA Structure and Function",
        description: "Explain the structure of DNA and its role in heredity",
        subject: "biology" as const,
        difficulty: "medium",
        xpReward: 70,
        estimatedMinutes: 5,
      },
      {
        title: "Thermodynamics Laws",
        description: "Teach the four laws of thermodynamics and their applications",
        subject: "physics" as const,
        difficulty: "hard",
        xpReward: 85,
        estimatedMinutes: 7,
      },
      {
        title: "Renaissance Art Movement",
        description: "Explain the characteristics and impact of Renaissance art",
        subject: "history" as const,
        difficulty: "medium",
        xpReward: 65,
        estimatedMinutes: 6,
      },
      {
        title: "Periodic Table Trends",
        description: "Describe periodic trends in atomic properties",
        subject: "chemistry" as const,
        difficulty: "medium",
        xpReward: 70,
        estimatedMinutes: 5,
      }
    ];

    for (const topic of defaultTopics) {
      try {
        await storage.createTopic(topic);
        console.log(`Created topic: ${topic.title}`);
      } catch (error) {
        console.log(`Topic ${topic.title} already exists or failed to create`);
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
        name: "Getting Started",
        description: "Complete 5 explanations",
        icon: "fas fa-play",
        color: "blue",
        criteria: { explanationsCount: 5 },
      },
      {
        name: "Science Specialist",
        description: "Complete 10 science explanations",
        icon: "fas fa-flask",
        color: "green",
        criteria: { explanationsCount: 10, subject: "science" },
      },
      {
        name: "Math Master",
        description: "Complete 10 mathematics explanations",
        icon: "fas fa-calculator",
        color: "purple",
        criteria: { explanationsCount: 10, subject: "mathematics" },
      },
      {
        name: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "fas fa-fire",
        color: "red",
        criteria: { streak: 7 },
      },
      {
        name: "Consistency King",
        description: "Maintain a 30-day streak",
        icon: "fas fa-crown",
        color: "yellow",
        criteria: { streak: 30 },
      },
      {
        name: "Top Scorer",
        description: "Achieve 90+ average score",
        icon: "fas fa-star",
        color: "yellow",
        criteria: { averageScore: 90 },
      },
      {
        name: "Perfect Score",
        description: "Get a perfect 100 score",
        icon: "fas fa-trophy",
        color: "yellow",
        criteria: { perfectScore: true },
      },
      {
        name: "Prolific Teacher",
        description: "Complete 50 explanations",
        icon: "fas fa-chalkboard-teacher",
        color: "blue",
        criteria: { explanationsCount: 50 },
      },
      {
        name: "Expert Explainer",
        description: "Complete 100 explanations",
        icon: "fas fa-medal",
        color: "blue",
        criteria: { explanationsCount: 100 },
      },
      {
        name: "Rising Star",
        description: "Reach Level 5",
        icon: "fas fa-star-shooting",
        color: "purple",
        criteria: { level: 5 },
      },
      {
        name: "Elite Learner",
        description: "Reach Level 10",
        icon: "fas fa-gem",
        color: "purple",
        criteria: { level: 10 },
      },
      {
        name: "Community Helper",
        description: "Get 50 upvotes on your explanations",
        icon: "fas fa-heart",
        color: "red",
        criteria: { totalUpvotes: 50 },
      },
      {
        name: "Popular Explainer",
        description: "Get 100 upvotes on your explanations",
        icon: "fas fa-thumbs-up",
        color: "green",
        criteria: { totalUpvotes: 100 },
      },
      {
        name: "Well Rounded",
        description: "Explain topics in 5 different subjects",
        icon: "fas fa-palette",
        color: "blue",
        criteria: { subjectDiversity: 5 },
      }
    ];

    for (const badge of defaultBadges) {
      try {
        await storage.createBadge(badge);
        console.log(`Created badge: ${badge.name}`);
      } catch (error) {
        console.log(`Badge ${badge.name} already exists or failed to create`);
      }
    }

    console.log('Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Failed to seed database' };
  }
}

// Auto-seed on startup in development
if (process.env.NODE_ENV === 'development') {
  // Add a small delay to ensure database connection is ready
  setTimeout(() => {
    seedDatabase().catch(console.error);
  }, 2000);
}

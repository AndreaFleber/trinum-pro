import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, gameScores, userStats, InsertGameScore, InsertUserStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get top scores for leaderboard (all difficulties or specific)
 */
export async function getTopScores(limit: number = 50, difficulty?: 'easy' | 'hard') {
  const db = await getDb();
  if (!db) return [];

  const baseQuery = db
    .select({
      id: gameScores.id,
      userId: gameScores.userId,
      userName: users.name,
      score: gameScores.score,
      difficulty: gameScores.difficulty,
      isPerfect: gameScores.isPerfect,
      createdAt: gameScores.createdAt,
    })
    .from(gameScores)
    .innerJoin(users, eq(gameScores.userId, users.id));

  const withDifficulty = difficulty
    ? baseQuery.where(eq(gameScores.difficulty, difficulty))
    : baseQuery;

  return await withDifficulty
    .orderBy((t) => desc(t.score))
    .limit(limit);
}

/**
 * Save a game score and update user stats
 */
export async function saveGameScore(userId: number, score: Omit<InsertGameScore, 'userId'>) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Insert the score
    await db.insert(gameScores).values({
      ...score,
      userId,
    } as InsertGameScore);

    // Update or create user stats
    const existingStats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    const difficulty = score.difficulty as 'easy' | 'hard';
    const isBestScore =
      difficulty === 'easy'
        ? score.score > (existingStats[0]?.bestScoreEasy || 0)
        : score.score > (existingStats[0]?.bestScoreHard || 0);

    if (existingStats.length > 0) {
      // Update existing stats
      const stats = existingStats[0];
      const updates: Record<string, any> = {};

      if (difficulty === 'easy') {
        updates.totalGamesEasy = stats.totalGamesEasy + 1;
        if (isBestScore) updates.bestScoreEasy = score.score;
        updates.averageScoreEasy = Math.round(
          (stats.averageScoreEasy * stats.totalGamesEasy + score.score) /
            (stats.totalGamesEasy + 1)
        );
      } else {
        updates.totalGamesHard = stats.totalGamesHard + 1;
        if (isBestScore) updates.bestScoreHard = score.score;
        updates.averageScoreHard = Math.round(
          (stats.averageScoreHard * stats.totalGamesHard + score.score) /
            (stats.totalGamesHard + 1)
        );
      }

      if (score.isPerfect) updates.perfectGames = stats.perfectGames + 1;

      await db.update(userStats).set(updates).where(eq(userStats.userId, userId));
    } else {
      // Create new stats
      const newStats: InsertUserStats = {
        userId,
        bestScoreEasy: difficulty === 'easy' ? score.score : 0,
        bestScoreHard: difficulty === 'hard' ? score.score : 0,
        totalGamesEasy: difficulty === 'easy' ? 1 : 0,
        totalGamesHard: difficulty === 'hard' ? 1 : 0,
        perfectGames: score.isPerfect ? 1 : 0,
        averageScoreEasy: difficulty === 'easy' ? score.score : 0,
        averageScoreHard: difficulty === 'hard' ? score.score : 0,
      };
      await db.insert(userStats).values(newStats);
    }

    return true;
  } catch (error) {
    console.error('[Database] Failed to save game score:', error);
    throw error;
  }
}

/**
 * Get user stats
 */
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get user's recent scores
 */
export async function getUserScores(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(gameScores)
    .where(eq(gameScores.userId, userId))
    .orderBy((t) => desc(t.createdAt))
    .limit(limit);
}

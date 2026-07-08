import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Game scores table - stores every game result for leaderboard and analytics
 */
export const gameScores = mysqlTable("gameScores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: int("score").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "hard"]).default("easy").notNull(),
  target: int("target").notNull(),
  result: int("result").notNull(),
  difference: int("difference").notNull(),
  isPerfect: int("isPerfect").default(0).notNull(), // 0 or 1 for boolean
  timeTaken: int("timeTaken").notNull(), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = typeof gameScores.$inferInsert;

/**
 * User stats table - aggregated statistics per user
 */
export const userStats = mysqlTable("userStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bestScoreEasy: int("bestScoreEasy").default(0).notNull(),
  bestScoreHard: int("bestScoreHard").default(0).notNull(),
  totalGamesEasy: int("totalGamesEasy").default(0).notNull(),
  totalGamesHard: int("totalGamesHard").default(0).notNull(),
  perfectGames: int("perfectGames").default(0).notNull(),
  averageScoreEasy: int("averageScoreEasy").default(0).notNull(),
  averageScoreHard: int("averageScoreHard").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;
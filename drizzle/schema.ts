import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "hard"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Google OAuth subject identifier (sub). Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Game scores table — stores every game result for leaderboard and analytics.
 */
export const gameScores = pgTable("gameScores", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  difficulty: difficultyEnum("difficulty").default("easy").notNull(),
  target: integer("target").notNull(),
  result: integer("result").notNull(),
  difference: integer("difference").notNull(),
  isPerfect: integer("isPerfect").default(0).notNull(), // 0 or 1 for boolean
  timeTaken: integer("timeTaken").notNull(), // seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = typeof gameScores.$inferInsert;

/**
 * User stats table — aggregated statistics per user.
 */
export const userStats = pgTable("userStats", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bestScoreEasy: integer("bestScoreEasy").default(0).notNull(),
  bestScoreHard: integer("bestScoreHard").default(0).notNull(),
  totalGamesEasy: integer("totalGamesEasy").default(0).notNull(),
  totalGamesHard: integer("totalGamesHard").default(0).notNull(),
  perfectGames: integer("perfectGames").default(0).notNull(),
  averageScoreEasy: integer("averageScoreEasy").default(0).notNull(),
  averageScoreHard: integer("averageScoreHard").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

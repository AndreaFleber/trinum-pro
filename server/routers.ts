import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getTopScores, saveGameScore, getUserStats, getUserScores } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    // Get top scores for leaderboard
    getTopScores: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
        difficulty: z.enum(['easy', 'hard']).optional(),
      }))
      .query(async ({ input }) => {
        return await getTopScores(input.limit, input.difficulty);
      }),

    // Save game score (protected)
    saveScore: protectedProcedure
      .input(z.object({
        score: z.number(),
        difficulty: z.enum(['easy', 'hard']),
        target: z.number(),
        result: z.number(),
        difference: z.number(),
        isPerfect: z.number(),
        timeTaken: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await saveGameScore(ctx.user!.id, input);
        return { success: true };
      }),

    // Get user stats
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
      return await getUserStats(ctx.user!.id);
    }),

    // Get user's recent scores
    getUserScores: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        return await getUserScores(ctx.user!.id, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;

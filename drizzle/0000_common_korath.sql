CREATE TYPE "public"."difficulty" AS ENUM('easy', 'hard');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "gameScores" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"score" integer NOT NULL,
	"difficulty" "difficulty" DEFAULT 'easy' NOT NULL,
	"target" integer NOT NULL,
	"result" integer NOT NULL,
	"difference" integer NOT NULL,
	"isPerfect" integer DEFAULT 0 NOT NULL,
	"timeTaken" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"bestScoreEasy" integer DEFAULT 0 NOT NULL,
	"bestScoreHard" integer DEFAULT 0 NOT NULL,
	"totalGamesEasy" integer DEFAULT 0 NOT NULL,
	"totalGamesHard" integer DEFAULT 0 NOT NULL,
	"perfectGames" integer DEFAULT 0 NOT NULL,
	"averageScoreEasy" integer DEFAULT 0 NOT NULL,
	"averageScoreHard" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userStats_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "gameScores" ADD CONSTRAINT "gameScores_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userStats" ADD CONSTRAINT "userStats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
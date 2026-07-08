CREATE TABLE `gameScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`difficulty` enum('easy','hard') NOT NULL DEFAULT 'easy',
	`target` int NOT NULL,
	`result` int NOT NULL,
	`difference` int NOT NULL,
	`isPerfect` int NOT NULL DEFAULT 0,
	`timeTaken` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bestScoreEasy` int NOT NULL DEFAULT 0,
	`bestScoreHard` int NOT NULL DEFAULT 0,
	`totalGamesEasy` int NOT NULL DEFAULT 0,
	`totalGamesHard` int NOT NULL DEFAULT 0,
	`perfectGames` int NOT NULL DEFAULT 0,
	`averageScoreEasy` int NOT NULL DEFAULT 0,
	`averageScoreHard` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `userStats_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `gameScores` ADD CONSTRAINT `gameScores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userStats` ADD CONSTRAINT `userStats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
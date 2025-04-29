-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "totalSets" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzes" INTEGER NOT NULL DEFAULT 0,
    "totalCards" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "bestQuizScore" INTEGER,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "todayQuizzes" INTEGER NOT NULL DEFAULT 0,
    "lastQuizDate" DATETIME,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "totalCardsLearned" INTEGER NOT NULL DEFAULT 0,
    "masteredCards" INTEGER NOT NULL DEFAULT 0,
    "totalLearnSessions" INTEGER NOT NULL DEFAULT 0,
    "todayLearnSessions" INTEGER NOT NULL DEFAULT 0,
    "lastLearnDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserStats" ("bestQuizScore", "correctAnswers", "createdAt", "id", "incorrectAnswers", "lastQuizDate", "longestStreak", "todayQuizzes", "totalCards", "totalQuizzes", "totalSets", "totalStudyTime", "updatedAt", "userId") SELECT "bestQuizScore", "correctAnswers", "createdAt", "id", "incorrectAnswers", "lastQuizDate", "longestStreak", "todayQuizzes", "totalCards", "totalQuizzes", "totalSets", "totalStudyTime", "updatedAt", "userId" FROM "UserStats";
DROP TABLE "UserStats";
ALTER TABLE "new_UserStats" RENAME TO "UserStats";
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

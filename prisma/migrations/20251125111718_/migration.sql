-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RepairJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "imei" TEXT,
    "reportedProblem" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "estimatedCost" REAL,
    "finalCost" REAL,
    "boxNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RepairJob" ("createdAt", "customerName", "customerPhone", "deviceModel", "estimatedCost", "finalCost", "id", "imei", "notes", "reportedProblem", "status", "updatedAt") SELECT "createdAt", "customerName", "customerPhone", "deviceModel", "estimatedCost", "finalCost", "id", "imei", "notes", "reportedProblem", "status", "updatedAt" FROM "RepairJob";
DROP TABLE "RepairJob";
ALTER TABLE "new_RepairJob" RENAME TO "RepairJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

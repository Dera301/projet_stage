-- AlterTable: Change cinRectoImagePath and cinVersoImagePath from VARCHAR(255) to TEXT
-- This allows storing image URLs of any length without restriction
ALTER TABLE "users" ALTER COLUMN "cinRectoImagePath" SET DATA TYPE TEXT;
ALTER TABLE "users" ALTER COLUMN "cinVersoImagePath" SET DATA TYPE TEXT;


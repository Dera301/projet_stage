-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verificationCode" VARCHAR(10),
ADD COLUMN     "verificationExpires" TIMESTAMP(3);

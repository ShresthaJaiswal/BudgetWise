-- CreateTable
CREATE TABLE "password_reset" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

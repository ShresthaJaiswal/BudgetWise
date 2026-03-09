-- CreateIndex
CREATE INDEX "transactions_user_id_status_idx" ON "transactions"("user_id", "status");

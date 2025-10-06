-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'created',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "has_completed_survey" BOOLEAN NOT NULL DEFAULT false,
    "has_voted" BOOLEAN NOT NULL DEFAULT false,
    "survey_token" VARCHAR(255),
    "vote_token" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "budget_min" INTEGER,
    "budget_max" INTEGER,
    "budget_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "available_start_date" DATE,
    "available_end_date" DATE,
    "date_flexibility" VARCHAR(20),
    "destination_preferences" JSONB,
    "travel_vibe" VARCHAR(100),
    "additional_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "destination_name" VARCHAR(255) NOT NULL,
    "destination_country" VARCHAR(100),
    "destination_region" VARCHAR(100),
    "description" TEXT,
    "image_url" VARCHAR(500),
    "rationale" TEXT,
    "match_score" DECIMAL(3,2),
    "estimated_cost_min" INTEGER,
    "estimated_cost_max" INTEGER,
    "cost_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "best_time_to_visit" VARCHAR(100),
    "key_activities" JSONB,
    "generated_by" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "rankings" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_results" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "winning_recommendation_id" TEXT,
    "rounds_data" JSONB,
    "final_tally" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voting_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_survey_token_key" ON "participants"("survey_token");

-- CreateIndex
CREATE UNIQUE INDEX "participants_vote_token_key" ON "participants"("vote_token");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_results" ADD CONSTRAINT "voting_results_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_results" ADD CONSTRAINT "voting_results_winning_recommendation_id_fkey" FOREIGN KEY ("winning_recommendation_id") REFERENCES "recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

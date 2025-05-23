

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_analysis_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_answer_id" "uuid" NOT NULL,
    "analysis_text" "text",
    "rating" "text",
    "suggestions" "text",
    "good_points" "text",
    "analyzed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ai_analysis_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "order_index" integer NOT NULL,
    "question_text" "text" NOT NULL,
    "question_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "topic" "text",
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL
);


ALTER TABLE "public"."interview_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "answer_text" "text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "years_of_experience" numeric,
    "primary_tech_stack" "text",
    "programming_languages" "text"[],
    "technologies" "text"[],
    "target_roles" "text"[],
    "target_companies" "text"[],
    "areas_of_interest" "text"[],
    "profile_complete" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_analysis_results"
    ADD CONSTRAINT "ai_analysis_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_analysis_results"
    ADD CONSTRAINT "ai_analysis_results_user_answer_id_key" UNIQUE ("user_answer_id");



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_session_id_order_index_key" UNIQUE ("session_id", "order_index");



ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_question_id_key" UNIQUE ("question_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "ai_analysis_results_user_answer_id_idx" ON "public"."ai_analysis_results" USING "btree" ("user_answer_id");



CREATE INDEX "interview_questions_session_id_idx" ON "public"."interview_questions" USING "btree" ("session_id");



CREATE INDEX "interview_sessions_status_idx" ON "public"."interview_sessions" USING "btree" ("status");



CREATE INDEX "interview_sessions_user_id_idx" ON "public"."interview_sessions" USING "btree" ("user_id");



CREATE INDEX "user_answers_question_id_idx" ON "public"."user_answers" USING "btree" ("question_id");



CREATE INDEX "user_answers_user_id_idx" ON "public"."user_answers" USING "btree" ("user_id");



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



ALTER TABLE ONLY "public"."ai_analysis_results"
    ADD CONSTRAINT "ai_analysis_results_user_answer_id_fkey" FOREIGN KEY ("user_answer_id") REFERENCES "public"."user_answers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."interview_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."ai_analysis_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";












































































































































































































GRANT ALL ON TABLE "public"."ai_analysis_results" TO "anon";
GRANT ALL ON TABLE "public"."ai_analysis_results" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_analysis_results" TO "service_role";



GRANT ALL ON TABLE "public"."interview_questions" TO "anon";
GRANT ALL ON TABLE "public"."interview_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_questions" TO "service_role";



GRANT ALL ON TABLE "public"."interview_sessions" TO "anon";
GRANT ALL ON TABLE "public"."interview_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_answers" TO "anon";
GRANT ALL ON TABLE "public"."user_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."user_answers" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

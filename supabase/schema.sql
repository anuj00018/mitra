-- ==========================================================
-- MITRA: Production PostgreSQL & Supabase Database Schema
-- Learning Companion for Neurodiverse Learners (Autism)
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Users: Parent, Educator, Admin)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('parent', 'educator', 'admin')),
  organization_name text,
  preferred_language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Children / Learner Profiles Table
create table if not exists public.children (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.profiles(id) on delete set null,
  name text not null,
  display_name text not null,
  avatar_key text default 'fox', -- 'fox', 'bear', 'owl', 'cat', 'koala', 'turtle'
  age_years int not null check (age_years >= 2 and age_years <= 18),
  primary_language text default 'en',
  learning_level text default 'emerging' check (learning_level in ('beginner', 'emerging', 'expanding', 'independent')),
  current_streak_days int default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Sensory & Accessibility Preferences
create table if not exists public.sensory_preferences (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade unique not null,
  sound_volume_percent int default 50 check (sound_volume_percent between 0 and 100),
  sound_effects_enabled boolean default true,
  voice_guidance_enabled boolean default true,
  voice_speed float default 0.9, -- Slightly slower speech for higher comprehension
  high_contrast_mode boolean default false,
  reduced_motion boolean default true,
  calm_color_palette text default 'gentle-sage' check (calm_color_palette in ('gentle-sage', 'soft-sky', 'warm-sand', 'muted-lavender')),
  font_size_scale text default 'large' check (font_size_scale in ('normal', 'large', 'extra-large')),
  haptic_feedback boolean default false,
  allow_timer_displays boolean default false, -- Timers often cause anxiety; disabled by default
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Learning Activities Catalog
create table if not exists public.activities (
  id text primary key, -- e.g. 'emotion-match', 'morning-routine', 'color-sorting', 'calm-sphere'
  title text not null,
  category text not null check (category in ('socio-emotional', 'daily-living', 'cognitive-sensory', 'regulation')),
  description text not null,
  recommended_difficulty int default 1 check (recommended_difficulty between 1 and 3),
  icon_name text not null,
  game_engine text default 'react' check (game_engine in ('react', 'phaser', 'canvas')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Learning Sessions & Interaction Logs
create table if not exists public.learning_sessions (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  activity_id text references public.activities(id) not null,
  session_date date default current_date not null,
  duration_seconds int not null default 0,
  completed boolean default false,
  prompts_needed int default 0,
  accuracy_rate float default 1.0,
  sensory_fatigue_flag boolean default false,
  child_mood_entry text check (child_mood_entry in ('calm', 'happy', 'overwhelmed', 'tired', 'focused')),
  recorded_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Educator Classroom Student Links & Assignments
create table if not exists public.educator_students (
  id uuid default gen_random_uuid() primary key,
  educator_id uuid references public.profiles(id) on delete cascade not null,
  child_id uuid references public.children(id) on delete cascade not null,
  assigned_difficulty int default 1 check (assigned_difficulty between 1 and 3),
  individual_education_plan_code text,
  iep_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (educator_id, child_id)
);

-- 7. Parent & Educator AI Insights (Empathetic, Actionable Recommendations)
create table if not exists public.learning_insights (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  generated_for_role text not null check (generated_for_role in ('parent', 'educator')),
  headline text not null,
  summary text not null,
  suggested_action text not null,
  confidence_score float default 0.95,
  is_acknowledged boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.sensory_preferences enable row level security;
alter table public.activities enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.educator_students enable row level security;
alter table public.learning_insights enable row level security;

-- Policies for Profiles
create policy "Users can view and update their own profile"
  on public.profiles for all
  using (auth.uid() = id);

-- Policies for Children: Parents can manage their children; Educators can view assigned students
create policy "Parents can view and modify their children"
  on public.children for all
  using (auth.uid() = parent_id);

create policy "Educators can view assigned students"
  on public.children for select
  using (
    exists (
      select 1 from public.educator_students
      where educator_students.child_id = children.id
      and educator_students.educator_id = auth.uid()
    )
  );

-- Policies for Sensory Preferences
create policy "Access sensory preferences if permitted to view child"
  on public.sensory_preferences for all
  using (
    exists (
      select 1 from public.children
      where children.id = sensory_preferences.child_id
      and (children.parent_id = auth.uid() or exists (
        select 1 from public.educator_students
        where educator_students.child_id = children.id
        and educator_students.educator_id = auth.uid()
      ))
    )
  );

-- Policies for Activities: Read-only for authenticated users
create policy "Activities are readable by all authenticated users"
  on public.activities for select
  to authenticated
  using (true);

-- Policies for Learning Sessions
create policy "Manage learning sessions for authorized children"
  on public.learning_sessions for all
  using (
    exists (
      select 1 from public.children
      where children.id = learning_sessions.child_id
      and (children.parent_id = auth.uid() or exists (
        select 1 from public.educator_students
        where educator_students.child_id = children.id
        and educator_students.educator_id = auth.uid()
      ))
    )
  );

-- Policies for Insights
create policy "Insights readable by parent or educator of child"
  on public.learning_insights for all
  using (
    exists (
      select 1 from public.children
      where children.id = learning_insights.child_id
      and (children.parent_id = auth.uid() or exists (
        select 1 from public.educator_students
        where educator_students.child_id = children.id
        and educator_students.educator_id = auth.uid()
      ))
    )
  );

-- ==========================================================
-- Initial Seed Catalog of Structured Activities
-- ==========================================================
insert into public.activities (id, title, category, description, recommended_difficulty, icon_name, game_engine)
values 
  ('emotion-match', 'Emotion Recognition', 'socio-emotional', 'Friendly cards identifying happy, calm, sad, surprised and sensory-overwhelmed expressions.', 1, 'smile', 'react'),
  ('daily-routine', 'Visual Schedule Sequencer', 'daily-living', 'First-Then visual schedule builder for morning and evening routines.', 1, 'calendar', 'react'),
  ('calm-sorting', 'Calm Shape & Color Sorting', 'cognitive-sensory', 'Tactile, low-stimulation visual sorting into gentle color bins.', 1, 'shapes', 'phaser'),
  ('sensory-sphere', 'Calm Breathing Rhythm', 'regulation', 'Gentle pulsing visual sphere guiding deep calming sensory breaths.', 1, 'wind', 'canvas')
on conflict (id) do nothing;

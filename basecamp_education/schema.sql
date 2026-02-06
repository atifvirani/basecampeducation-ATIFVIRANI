-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Enums
create type user_role as enum ('super_admin', 'tutor', 'student', 'parent');
create type class_status as enum ('scheduled', 'ongoing', 'completed', 'cancelled');

-- 2. Tables

-- Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role user_role,
  phone text
);

-- Tutor Settings Table
create table tutor_settings (
  id uuid references profiles(id) on delete cascade primary key,
  gps_lat double precision,
  gps_long double precision,
  radius_meters int default 50,
  trust_score int default 100
);

-- Classes Table
create table classes (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references profiles(id),
  student_id uuid references profiles(id),
  start_time timestamptz,
  end_time timestamptz,
  status class_status default 'scheduled',
  gps_verified boolean default false
);

-- Homework Table
create table homework (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references classes(id),
  image_url text,
  submitted_at timestamptz default now()
);

-- 3. Security (RLS)

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table tutor_settings enable row level security;
alter table classes enable row level security;
alter table homework enable row level security;

-- Policies

-- Profiles: Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Profiles: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Tutor Settings: Tutors can read their own settings
create policy "Tutors can read own settings"
  on tutor_settings for select
  using ( auth.uid() = id );

-- Classes: Users can read classes they are involved in (as tutor or student)
create policy "Users can read their classes"
  on classes for select
  using ( auth.uid() = tutor_id or auth.uid() = student_id );

-- Homework: Users can read homework for their classes
create policy "Users can read their homework"
  on homework for select
  using ( 
    exists (
      select 1 from classes
      where classes.id = homework.class_id
      and (classes.tutor_id = auth.uid() or classes.student_id = auth.uid())
    )
  );

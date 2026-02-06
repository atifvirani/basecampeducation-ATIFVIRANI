-- Helper to create dummy user in auth.users (Requires sufficient privileges, e.g. service_role key or superuser in SQL Editor)
-- NOTE: In a real app, users are created via Auth API. This is for SQL Editor testing.

DO $$
DECLARE
  new_tutor_id uuid := uuid_generate_v4();
  new_student_id uuid := uuid_generate_v4();
BEGIN
  -- 1. Insert Dummy Tutor into auth.users (Simulated)
  -- For strict FK constraints, we need a real user. 
  -- IF YOU CANNOT INSERT INTO auth.users directly, replace 'new_tutor_id' with a real UUID from your Authentication tab.
  
  -- Insert into auth.users is usually restricted. 
  -- We will simulate by inserting into profiles directly, assuming we bypassed referential integrity OR we are running this with a user that exists.
  -- For the purpose of this test script to run in Supabase SQL Editor which usually allows superadmin actions:
  
  INSERT INTO auth.users (id, email)
  VALUES (new_tutor_id, 'tutor.john@example.com')
  ON CONFLICT (id) DO NOTHING; -- Avoid error if exists

    INSERT INTO auth.users (id, email)
  VALUES (new_student_id, 'student.jane@example.com')
  ON CONFLICT (id) DO NOTHING; 

  -- 2. Create Profile for Tutor John
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new_tutor_id, 'Tutor John', 'tutor')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Initialize Tutor Settings
  INSERT INTO public.tutor_settings (id, trust_score)
  VALUES (new_tutor_id, 100)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Create Class (Scheduled) - Assigning to variable for update later not straightforward in pure SQL script block without preserving state, 
  -- so we will do it in steps.
  
  INSERT INTO public.classes (id, tutor_id, student_id, status, gps_verified)
  VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', new_tutor_id, new_student_id, 'scheduled', false);  -- Fixed ID for testing update
  
END $$;

-- Verify Initial State
SELECT * FROM tutor_settings WHERE id IN (SELECT id FROM profiles WHERE full_name = 'Tutor John');

-- 5. Update Class to Completed + GPS Verified
UPDATE public.classes
SET status = 'completed', gps_verified = true
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- 6. Verify Trust Score Increased (Should be 101)
SELECT * FROM tutor_settings JOIN profiles ON tutor_settings.id = profiles.id WHERE profiles.full_name = 'Tutor John';

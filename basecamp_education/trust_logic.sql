-- Function to calculate trust score
create or replace function calculate_trust_score()
returns trigger as $$
declare
  current_score int;
begin
  -- Get current trust score
  select trust_score into current_score
  from tutor_settings
  where id = new.tutor_id;

  -- Logic: Completed and GPS Verified -> Increase by 1
  if new.status = 'completed' and new.gps_verified = true then
    update tutor_settings
    set trust_score = trust_score + 1
    where id = new.tutor_id;
  end if;

  -- Logic: Cancelled -> Decrease by 5
  if new.status = 'cancelled' then
    update tutor_settings
    set trust_score = trust_score - 5
    where id = new.tutor_id;
    
    -- Check for probation
    if (current_score - 5) < 50 then
      raise warning 'Tutor % trust score dropped below 50!', new.tutor_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger update_trust_score
after update on classes
for each row
execute function calculate_trust_score();

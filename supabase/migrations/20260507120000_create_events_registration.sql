-- Activity registration MVP

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  subtitle text,
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  summary text,
  content text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  registration_starts_at timestamptz,
  registration_ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'archived')),
  is_public boolean not null default true,
  created_by uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.event_organizers (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'editor'
    check (role in ('owner', 'editor')),
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

create table if not exists public.event_form_fields (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  field_key text not null,
  label text not null,
  field_type text not null
    check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox', 'boolean')),
  is_required boolean not null default false,
  sort_order integer not null default 0,
  options jsonb not null default '[]'::jsonb,
  placeholder text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  unique (event_id, field_key)
);

create table if not exists public.event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  gender text not null,
  age integer check (age is null or age > 0),
  church_name text not null,
  phone text not null,
  wechat_id text,
  is_first_time boolean not null default false,
  remark text,
  status text not null default 'submitted'
    check (status in ('submitted', 'cancelled', 'waitlisted')),
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (event_id, user_id)
);

create table if not exists public.event_registration_answers (
  id uuid default gen_random_uuid() primary key,
  registration_id uuid references public.event_registrations(id) on delete cascade not null,
  field_id uuid references public.event_form_fields(id) on delete cascade not null,
  answer_text text,
  answer_json jsonb,
  created_at timestamptz default now(),
  unique (registration_id, field_id)
);

create index if not exists events_status_idx on public.events (status);
create index if not exists events_registration_ends_at_idx on public.events (registration_ends_at);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists event_organizers_user_id_idx on public.event_organizers (user_id);
create index if not exists event_form_fields_event_id_sort_order_idx on public.event_form_fields (event_id, sort_order);
create index if not exists event_registrations_event_id_idx on public.event_registrations (event_id);
create index if not exists event_registrations_user_id_idx on public.event_registrations (user_id);
create index if not exists event_registrations_phone_idx on public.event_registrations (phone);
create index if not exists event_registration_answers_registration_id_idx on public.event_registration_answers (registration_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute procedure public.set_updated_at();

drop trigger if exists set_event_registrations_updated_at on public.event_registrations;
create trigger set_event_registrations_updated_at
before update on public.event_registrations
for each row execute procedure public.set_updated_at();

alter table public.events enable row level security;
alter table public.event_organizers enable row level security;
alter table public.event_form_fields enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_registration_answers enable row level security;

create policy "Public can view open events"
  on public.events for select
  using (
    is_public = true
    and status in ('open', 'closed')
  );

create policy "Admins can manage all events"
  on public.events for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Organizers can view their events"
  on public.events for select
  using (
    exists (
      select 1 from public.event_organizers eo
      where eo.event_id = id and eo.user_id = auth.uid()
    )
  );

create policy "Organizers can update their events"
  on public.events for update
  using (
    exists (
      select 1 from public.event_organizers eo
      where eo.event_id = id and eo.user_id = auth.uid()
    )
  );

create policy "Admins can manage organizers"
  on public.event_organizers for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Users can view their organizer assignments"
  on public.event_organizers for select
  using (auth.uid() = user_id);

create policy "Users can view fields for public events"
  on public.event_form_fields for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and e.is_public = true
        and e.status in ('open', 'closed')
    )
  );

create policy "Admins can manage form fields"
  on public.event_form_fields for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "Organizers can manage form fields for their events"
  on public.event_form_fields for all
  using (
    exists (
      select 1 from public.event_organizers eo
      where eo.event_id = event_id and eo.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.event_organizers eo
      where eo.event_id = event_id and eo.user_id = auth.uid()
    )
  );

create policy "Users can insert their own registrations"
  on public.event_registrations for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.events e
      where e.id = event_id
        and e.is_public = true
        and e.status = 'open'
        and (e.registration_starts_at is null or e.registration_starts_at <= now())
        and (e.registration_ends_at is null or e.registration_ends_at >= now())
    )
  );

create policy "Users can view their own registrations"
  on public.event_registrations for select
  using (auth.uid() = user_id);

create policy "Admins can view all registrations"
  on public.event_registrations for select
  using (public.is_admin_user());

create policy "Organizers can view registrations of their events"
  on public.event_registrations for select
  using (
    exists (
      select 1 from public.event_organizers eo
      where eo.event_id = event_id and eo.user_id = auth.uid()
    )
  );

create policy "Users can update their own registrations"
  on public.event_registrations for update
  using (auth.uid() = user_id);

create policy "Users can insert answers for their own registrations"
  on public.event_registration_answers for insert
  with check (
    exists (
      select 1 from public.event_registrations er
      where er.id = registration_id
        and er.user_id = auth.uid()
    )
  );

create policy "Users can view answers for their own registrations"
  on public.event_registration_answers for select
  using (
    exists (
      select 1 from public.event_registrations er
      where er.id = registration_id
        and er.user_id = auth.uid()
    )
  );

create policy "Admins can view all answers"
  on public.event_registration_answers for select
  using (public.is_admin_user());

create policy "Organizers can view answers of their events"
  on public.event_registration_answers for select
  using (
    exists (
      select 1
      from public.event_registrations er
      join public.event_organizers eo on eo.event_id = er.event_id
      where er.id = registration_id
        and eo.user_id = auth.uid()
    )
  );

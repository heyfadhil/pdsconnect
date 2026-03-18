-- Phase 6: Product Showcase, PDF Catalogues, Event Thumbnails

-- ───────────────────────────────────────────────
-- 6.5  Event thumbnail
-- ───────────────────────────────────────────────
alter table events
  add column if not exists thumbnail_url text;

-- ───────────────────────────────────────────────
-- 6.1  Products (global library per seller/buyer)
-- ───────────────────────────────────────────────
create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  name           text not null,
  description    text,
  thumbnail_url  text,
  created_at     timestamptz not null default now()
);

create index if not exists products_user_id_idx on products(user_id);

alter table products enable row level security;

-- Users can manage their own products
create policy "Users can select own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on products for delete
  using (auth.uid() = user_id);

-- Admins can read all products
create policy "Admins can select all products"
  on products for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- Participants can view products of other participants in shared events
create policy "Participants can view co-participant products"
  on products for select
  using (
    exists (
      select 1 from event_participants ep1
      join event_participants ep2 on ep1.event_id = ep2.event_id
      where ep1.user_id = auth.uid()
        and ep2.user_id = products.user_id
    )
  );

-- ───────────────────────────────────────────────
-- Per-event product selection
-- ───────────────────────────────────────────────
create table if not exists event_products (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  product_id     uuid not null references products(id) on delete cascade,
  display_order  int not null default 0,
  unique(event_id, product_id)
);

create index if not exists event_products_event_user_idx on event_products(event_id, user_id);

alter table event_products enable row level security;

create policy "Users can manage own event products"
  on event_products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can select all event products"
  on event_products for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Participants can view co-participant event products"
  on event_products for select
  using (
    exists (
      select 1 from event_participants ep1
      join event_participants ep2 on ep1.event_id = ep2.event_id
      where ep1.user_id = auth.uid()
        and ep2.user_id = event_products.user_id
        and ep2.event_id = event_products.event_id
    )
  );

-- ───────────────────────────────────────────────
-- 6.2  Catalogues (global PDF library)
-- ───────────────────────────────────────────────
create table if not exists catalogues (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  name        text not null,
  file_url    text not null,
  created_at  timestamptz not null default now()
);

create index if not exists catalogues_user_id_idx on catalogues(user_id);

alter table catalogues enable row level security;

create policy "Users can manage own catalogues"
  on catalogues for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can select all catalogues"
  on catalogues for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Participants can view co-participant catalogues"
  on catalogues for select
  using (
    exists (
      select 1 from event_participants ep1
      join event_participants ep2 on ep1.event_id = ep2.event_id
      where ep1.user_id = auth.uid()
        and ep2.user_id = catalogues.user_id
    )
  );

-- ───────────────────────────────────────────────
-- Per-event catalogue selection
-- ───────────────────────────────────────────────
create table if not exists event_catalogues (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  catalogue_id uuid not null references catalogues(id) on delete cascade,
  unique(event_id, catalogue_id)
);

create index if not exists event_catalogues_event_user_idx on event_catalogues(event_id, user_id);

alter table event_catalogues enable row level security;

create policy "Users can manage own event catalogues"
  on event_catalogues for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can select all event catalogues"
  on event_catalogues for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Participants can view co-participant event catalogues"
  on event_catalogues for select
  using (
    exists (
      select 1 from event_participants ep1
      join event_participants ep2 on ep1.event_id = ep2.event_id
      where ep1.user_id = auth.uid()
        and ep2.user_id = event_catalogues.user_id
        and ep2.event_id = event_catalogues.event_id
    )
  );

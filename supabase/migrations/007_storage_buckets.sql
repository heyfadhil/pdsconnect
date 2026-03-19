-- Phase 6: Supabase Storage buckets for uploaded assets

-- ───────────────────────────────────────────────
-- Buckets (public read, user-folder uploads)
-- ───────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos',            'logos',            true, 5242880,
    array['image/jpeg','image/png','image/webp','image/gif']),
  ('product-images',   'product-images',   true, 5242880,
    array['image/jpeg','image/png','image/webp','image/gif']),
  ('event-thumbnails', 'event-thumbnails', true, 5242880,
    array['image/jpeg','image/png','image/webp','image/gif']),
  ('catalogues',       'catalogues',       true, 52428800,
    array['application/pdf'])
on conflict (id) do nothing;

-- ───────────────────────────────────────────────
-- RLS: public SELECT (buckets are already public,
--      but explicit policy avoids ambiguity)
-- ───────────────────────────────────────────────
create policy "Public read – logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Public read – product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Public read – event-thumbnails"
  on storage.objects for select
  using (bucket_id = 'event-thumbnails');

create policy "Public read – catalogues"
  on storage.objects for select
  using (bucket_id = 'catalogues');

-- ───────────────────────────────────────────────
-- RLS: authenticated users upload to their own
--      folder  (<userId>/<filename>)
-- ───────────────────────────────────────────────
create policy "Auth upload – logos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth upload – product-images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth upload – event-thumbnails"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth upload – catalogues"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'catalogues'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────────────────────────
-- RLS: users can replace (upsert) their own files
-- ───────────────────────────────────────────────
create policy "Auth update – logos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update – product-images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update – event-thumbnails"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'event-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth update – catalogues"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'catalogues'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ───────────────────────────────────────────────
-- RLS: users can delete their own files
-- ───────────────────────────────────────────────
create policy "Auth delete – logos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth delete – product-images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth delete – event-thumbnails"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Auth delete – catalogues"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'catalogues'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can upload event thumbnails to any folder
create policy "Admin upload – event-thumbnails"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'event-thumbnails'
    and exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "Admin update – event-thumbnails"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'event-thumbnails'
    and exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "Admin delete – event-thumbnails"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'event-thumbnails'
    and exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
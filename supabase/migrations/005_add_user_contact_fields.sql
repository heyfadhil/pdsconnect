-- Add contact and business fields to users table
alter table users
  add column if not exists phone         text,
  add column if not exists mobile        text,
  add column if not exists title         text,
  add column if not exists business_type text,
  add column if not exists item          text;

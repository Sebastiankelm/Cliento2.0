/*
 * ============================================================
 * PEŁNA MIGRACJA SUPABASE - WSZYSTKIE SCHEMATY MAKERKIT + CRM
 * ============================================================
 * 
 * UWAGA: Ten plik zawiera wszystkie schematy Makerkit w jednym miejscu.
 * Wykonaj go w Supabase Dashboard → SQL Editor
 * 
 * Kolejność: 00-privileges → 01-enums → ... → 19-clients-permissions
 * 
 * ============================================================
 */

-- ============================================================
-- 00-PRIVILEGES
-- ============================================================
-- Create a private Makerkit schema
create schema if not exists kit;
create extension if not exists "unaccent" schema kit;

alter default privileges revoke execute on functions from public;

revoke all on schema public from public;
revoke all PRIVILEGES on database "postgres" from "anon";
revoke all PRIVILEGES on schema "public" from "anon";
revoke all PRIVILEGES on schema "storage" from "anon";
revoke all PRIVILEGES on all SEQUENCES in schema "public" from "anon";
revoke all PRIVILEGES on all SEQUENCES in schema "storage" from "anon";
revoke all PRIVILEGES on all FUNCTIONS in schema "public" from "anon";
revoke all PRIVILEGES on all FUNCTIONS in schema "storage" from "anon";
revoke all PRIVILEGES on all TABLES in schema "public" from "anon";
revoke all PRIVILEGES on all TABLES in schema "storage" from "anon";

alter default privileges in schema public revoke execute on functions from anon, authenticated;

grant usage on schema public to authenticated;
grant usage on schema public to service_role;

-- ============================================================
-- UWAGA: Ten plik jest za duży dla jednej migracji
-- Użyj schematów po kolei z katalogu schemas/ lub
-- skopiuj zawartość plików schemas/*.sql jeden po drugim
-- ============================================================

/*
 * -------------------------------------------------------
 * Section: CRM Permissions
 * 
 * ⚠️ IMPORTANT: This file has been split into two parts:
 * 
 * 1. 36-crm-permissions-part1-enum-values.sql - Add enum values (run first)
 * 2. 36-crm-permissions-part2-role-assignments.sql - Assign to roles (run after)
 * 
 * This file is kept for reference but should NOT be executed directly.
 * Use the two separate files above instead.
 * 
 * Reason: PostgreSQL requires each ALTER TYPE ADD VALUE to be in a separate transaction.
 * Running all ALTER TYPE commands together causes "unsafe use of new value" errors.
 * -------------------------------------------------------
 */

-- This file is deprecated - use the two-part files instead:
-- 36-crm-permissions-part1-enum-values.sql
-- 36-crm-permissions-part2-role-assignments.sql

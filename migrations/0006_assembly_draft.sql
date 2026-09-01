-- Черновики повесток: публикует только совет дома.
alter table assemblies drop constraint if exists assemblies_status_check;
alter table assemblies add constraint assemblies_status_check
  check (status in ('draft', 'open', 'closed'));

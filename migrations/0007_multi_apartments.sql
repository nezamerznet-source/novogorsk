-- Несколько квартир на один аккаунт. Голос пишется на каждую квартиру.
alter table owners add column if not exists id serial;
alter table owners drop constraint if exists owners_pkey;
alter table owners add primary key (id);
create index if not exists owners_user_id_idx on owners (user_id);

alter table ballots drop constraint if exists ballots_question_id_user_id_key;
create unique index if not exists ballots_question_apt_uidx
  on ballots (question_id, building_id, apartment);

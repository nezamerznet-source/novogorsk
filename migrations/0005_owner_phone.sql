-- Телефон собственника для связи. Email по-прежнему только в аккаунте.
alter table owners add column if not exists phone text;

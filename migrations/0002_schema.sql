-- ЖК «Новогорск. Три дома» — открытое собрание собственников

create table if not exists buildings (
  id serial primary key,
  name text not null,
  address text not null default ''
);

create table if not exists complex_settings (
  id integer primary key default 1,
  name text not null,
  total_apartments integer,
  total_area numeric(12, 2),
  constraint complex_settings_singleton check (id = 1)
);

create table if not exists owners (
  user_id text primary key,
  full_name text not null,
  building_id integer not null references buildings (id),
  apartment text not null,
  area_sqm numeric(8, 2) not null check (area_sqm > 0 and area_sqm < 1000),
  role text not null default 'owner' check (role in ('owner', 'council')),
  created_at timestamptz not null default now(),
  unique (building_id, apartment)
);

create index if not exists owners_building_idx on owners (building_id);

create table if not exists assemblies (
  id serial primary key,
  title text not null,
  description text not null default '',
  created_by text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  opens_at timestamptz not null default now(),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id serial primary key,
  assembly_id integer not null references assemblies (id) on delete cascade,
  ordinal integer not null,
  title text not null,
  description text not null default ''
);

create index if not exists questions_assembly_idx on questions (assembly_id);

create table if not exists ballots (
  id serial primary key,
  question_id integer not null references questions (id) on delete cascade,
  user_id text not null,
  choice text not null check (choice in ('for', 'against', 'abstain')),
  area_sqm numeric(8, 2) not null,
  building_id integer not null references buildings (id),
  apartment text not null,
  voted_at timestamptz not null default now(),
  unique (question_id, user_id)
);

create index if not exists ballots_question_idx on ballots (question_id);

insert into buildings (name, address)
select v.name, v.address
from (
  values
    ('Дом 1', 'ЖК «Новогорск. Три дома»'),
    ('Дом 2', 'ЖК «Новогорск. Три дома»'),
    ('Дом 3', 'ЖК «Новогорск. Три дома»')
) as v(name, address)
where not exists (select 1 from buildings);

insert into complex_settings (id, name, total_apartments, total_area)
values (1, 'Новогорск. Три дома', null, null)
on conflict (id) do nothing;

insert into assemblies (title, description, created_by, status, closes_at)
select
  'Тарифы и управляющая компания',
  'Независимое голосование собственников трёх домов. Это не собрание по ЖК РФ и не заменяет официальный протокол УК — но позволяет открыто увидеть реальное мнение двора: кто как проголосовал и как считается итог. Каждый голос привязан к квартире и площади, реестр виден всем.',
  'system',
  'open',
  now() + interval '21 days'
where not exists (select 1 from assemblies);

insert into questions (assembly_id, ordinal, title, description)
select a.id, 1,
  'Согласны ли вы с повышением тарифа на содержание жилья?',
  'Голос «против» означает, что предложенное УК повышение для вас неприемлемо.'
from assemblies a
where a.created_by = 'system'
  and not exists (select 1 from questions q where q.assembly_id = a.id and q.ordinal = 1);

insert into questions (assembly_id, ordinal, title, description)
select a.id, 2,
  'Следует ли сменить управляющую компанию?',
  'Речь о принципиальной позиции собственников, а не о юридической процедуре расторжения договора.'
from assemblies a
where a.created_by = 'system'
  and not exists (select 1 from questions q where q.assembly_id = a.id and q.ordinal = 2);

insert into questions (assembly_id, ordinal, title, description)
select a.id, 3,
  'Нужен ли повторный подсчёт бюллетеней последнего собрания?',
  'С участием инициативной группы собственников и открытым реестром, чтобы сверить цифры УК.'
from assemblies a
where a.created_by = 'system'
  and not exists (select 1 from questions q where q.assembly_id = a.id and q.ordinal = 3);

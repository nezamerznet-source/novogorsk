-- ЖК «Новогорск Курорт»: дома 1–3, в каждом корпуса 1–3

alter table buildings add column if not exists house_no integer;
alter table buildings add column if not exists corpus_no integer;

update buildings
set
  house_no = coalesce(house_no, id),
  corpus_no = coalesce(corpus_no, 1)
where id in (1, 2, 3) and (house_no is null or corpus_no is null);

insert into buildings (name, address, house_no, corpus_no)
select v.name, v.address, v.house_no, v.corpus_no
from (
  values
    ('Дом 1, корпус 1', 'ЖК «Новогорск Курорт»', 1, 1),
    ('Дом 1, корпус 2', 'ЖК «Новогорск Курорт»', 1, 2),
    ('Дом 1, корпус 3', 'ЖК «Новогорск Курорт»', 1, 3),
    ('Дом 2, корпус 1', 'ЖК «Новогорск Курорт»', 2, 1),
    ('Дом 2, корпус 2', 'ЖК «Новогорск Курорт»', 2, 2),
    ('Дом 2, корпус 3', 'ЖК «Новогорск Курорт»', 2, 3),
    ('Дом 3, корпус 1', 'ЖК «Новогорск Курорт»', 3, 1),
    ('Дом 3, корпус 2', 'ЖК «Новогорск Курорт»', 3, 2),
    ('Дом 3, корпус 3', 'ЖК «Новогорск Курорт»', 3, 3)
) as v(name, address, house_no, corpus_no)
where not exists (
  select 1 from buildings b
  where b.house_no = v.house_no and b.corpus_no = v.corpus_no
);

update buildings
set
  name = 'Дом ' || house_no || ', корпус ' || corpus_no,
  address = 'ЖК «Новогорск Курорт»'
where house_no between 1 and 3
  and corpus_no between 1 and 3;

create unique index if not exists buildings_house_corpus_uidx
  on buildings (house_no, corpus_no);

update complex_settings
set name = 'Новогорск Курорт'
where id = 1;

update assemblies
set description = 'Независимое голосование собственников ЖК «Новогорск Курорт». Три дома, в каждом — три корпуса. Это не собрание по ЖК РФ и не заменяет официальный протокол УК — но позволяет открыто увидеть реальное мнение двора: кто как проголосовал и как считается итог. Каждый голос привязан к квартире и площади, реестр виден всем.'
where created_by = 'system'
  and title = 'Тарифы и управляющая компания';

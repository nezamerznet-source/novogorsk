-- ЖК «Новогорск Курорт»: один дом — 52, три корпуса.

drop index if exists buildings_house_corpus_uidx;

delete from owners o
where o.building_id not in (select min(id) from buildings group by corpus_no)
  and exists (
    select 1
    from owners k
    join buildings kb on kb.id = k.building_id
    join buildings ob on ob.id = o.building_id
    where kb.corpus_no = ob.corpus_no
      and k.apartment = o.apartment
      and k.building_id = (
        select min(id) from buildings b2 where b2.corpus_no = ob.corpus_no
      )
  );

update owners o
set building_id = (
  select min(b2.id)
  from buildings b2
  where b2.corpus_no = (select b.corpus_no from buildings b where b.id = o.building_id)
)
where o.building_id not in (select min(id) from buildings group by corpus_no);

update ballots o
set building_id = (
  select min(b2.id)
  from buildings b2
  where b2.corpus_no = (select b.corpus_no from buildings b where b.id = o.building_id)
)
where o.building_id not in (select min(id) from buildings group by corpus_no);

delete from buildings
where id not in (select min(id) from buildings group by corpus_no);

update buildings
set
  house_no = 52,
  name = 'Дом 52, корпус ' || corpus_no,
  address = 'ЖК «Новогорск Курорт»';

create unique index if not exists buildings_house_corpus_uidx
  on buildings (house_no, corpus_no);

update assemblies
set description = 'Независимое голосование собственников ЖК «Новогорск Курорт». Дом 52, корпуса 1, 2 и 3. Это не собрание по ЖК РФ и не заменяет официальный протокол УК — но позволяет открыто увидеть реальное мнение двора: кто как проголосовал и как считается итог. Каждый голос привязан к квартире и площади, реестр виден всем.'
where created_by = 'system'
  and title = 'Тарифы и управляющая компания';

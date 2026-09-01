-- Дом 51, корпуса 1–3 (исправление номера).
update buildings
set
  house_no = 51,
  name = 'Дом 51, корпус ' || corpus_no
where house_no = 52 or name like 'Дом 52%';

update assemblies
set description = replace(description, 'Дом 52', 'Дом 51')
where description like '%Дом 52%';

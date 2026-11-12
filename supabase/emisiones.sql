-- Referencia: tabla que el equipo de backend ya tiene (ajusta nombres si difieren).
create table if not exists public.emisiones (
  id uuid primary key default gen_random_uuid(),
  fuente text not null check (char_length(btrim(fuente)) between 2 and 100),
  categoria text not null check (categoria in ('Transporte', 'Energía', 'Residuos')),
  co2_kg numeric(12, 2) not null check (co2_kg >= 0),
  created_at timestamptz not null default now()
);
alter table public.emisiones enable row level security;
-- Demo: lectura/inserción para usuarios autenticados. En producción, filtra por empresa.
create policy emisiones_select on public.emisiones for select to authenticated using (true);
create policy emisiones_insert on public.emisiones for insert to authenticated with check (true);

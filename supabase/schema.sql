-- ============================================
-- CozinhaPro — Schema do Banco de Dados
-- Executar no Supabase SQL Editor
-- ============================================

-- Organizações (cada casa/pousada é uma organização)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plano text not null default 'trial',  -- trial | basico | premium
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Extensão do perfil de usuário (vinculado ao auth.users do Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  nome_casa text,
  email text,
  criado_em timestamptz not null default now()
);

-- Ingredientes com preços (por organização)
create table ingredientes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome text not null,
  categoria text not null default 'proteina',
  preco_por_kg numeric(10,2) not null default 0,
  fator_correcao numeric(5,3) not null default 1.0,
  fator_coccao numeric(5,3) not null default 0.80,
  unidade text not null default 'kg',
  atualizado_em timestamptz not null default now()
);

-- Receitas
create table receitas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome text not null,
  porcoes_base integer not null default 4,
  markup numeric(4,2) not null default 3.0,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Ingredientes de cada receita
create table receita_ingredientes (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references receitas(id) on delete cascade,
  ingrediente_nome text not null,
  quantidade_liquida_kg numeric(10,3) not null,
  preco_unitario numeric(10,2) not null,
  fator_correcao numeric(5,3) not null default 1.0,
  fator_coccao numeric(5,3) not null default 0.80,
  categoria text not null default 'proteina'
);

-- Histórico de cálculos
create table calculos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  receita_id uuid references receitas(id),
  receita_nome text not null,
  numero_pessoas integer not null,
  markup numeric(4,2) not null,
  resultado jsonb not null,  -- guarda os 3 cenários completos
  criado_em timestamptz not null default now()
);

-- ============================================
-- Row Level Security (RLS) — Segurança multi-tenant
-- Cada casa só vê seus próprios dados
-- ============================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table ingredientes enable row level security;
alter table receitas enable row level security;
alter table receita_ingredientes enable row level security;
alter table calculos enable row level security;

-- Profiles: usuário vê só o próprio perfil
create policy "Usuário vê próprio perfil"
  on profiles for all
  using (id = auth.uid());

-- Ingredientes: vê só da própria organização
create policy "Ingredientes da organização"
  on ingredientes for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- Receitas: vê só da própria organização
create policy "Receitas da organização"
  on receitas for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- Ingredientes de receita: via receita da organização
create policy "Ingredientes de receita da organização"
  on receita_ingredientes for all
  using (receita_id in (
    select id from receitas
    where organization_id = (select organization_id from profiles where id = auth.uid())
  ));

-- Cálculos: vê só da própria organização
create policy "Cálculos da organização"
  on calculos for all
  using (organization_id = (select organization_id from profiles where id = auth.uid()));

-- ============================================
-- Trigger: criar organização automaticamente no cadastro
-- ============================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  org_id uuid;
begin
  insert into organizations (nome)
  values (coalesce(new.raw_user_meta_data->>'nome_casa', 'Minha Casa'))
  returning id into org_id;

  insert into profiles (id, organization_id, nome_casa, email)
  values (new.id, org_id, new.raw_user_meta_data->>'nome_casa', new.email);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

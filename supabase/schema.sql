-- ============================================================
-- VICKLY · Esquema inicial de base de datos
-- Modelo: todo usuario = propietario de un workspace.
-- No hay tabla ni rol "individual" separado: si workspace_members
-- está vacía, la interfaz se comporta como "modo individual".
-- ============================================================

-- Cada usuario que se registra tiene un workspace del cual es dueño.
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi espacio de trabajo',
  created_at timestamptz not null default now()
);

-- Miembros agregados a un workspace (si hay filas acá, es "modo equipo").
-- user_id puede ser null si el miembro todavía no tiene cuenta propia.
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  created_at timestamptz not null default now()
);

-- Proyectos dentro de un workspace.
create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Qué miembros están asignados a qué proyecto.
create table project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  member_id uuid not null references workspace_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, member_id)
);

-- Registros de horas trabajadas.
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  member_id uuid not null references workspace_members(id) on delete cascade,
  entry_date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  note text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Seguridad: se activa RLS (Row Level Security) en todas las
-- tablas desde el día uno. Por ahora quedan SIN políticas propias,
-- lo cual las deja bloqueadas para cualquiera que no sea el service
-- role. Vamos a escribir las políticas reales (propietario ve todo
-- lo suyo, miembro ve solo lo propio) en el paso de autenticación.
-- ============================================================
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table project_assignments enable row level security;
alter table time_entries enable row level security;

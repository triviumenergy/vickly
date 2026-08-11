-- ============================================================
-- VICKLY · Autenticación: creación automática de workspace + RLS
-- Correr esto UNA VEZ en el SQL Editor de Supabase, después del
-- schema.sql inicial.
-- ============================================================

-- Cuando alguien se registra, se le crea su workspace solo.
-- No existe un paso separado de "elegir modo individual": todo
-- usuario nuevo arranca siendo propietario de un workspace vacío.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.workspaces (owner_id, name)
  values (new.id, 'Mi espacio de trabajo');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Políticas de seguridad (RLS)
-- Por ahora cubren al PROPIETARIO viendo y editando lo suyo.
-- Cuando construyamos el módulo "Miembros" vamos a sumar políticas
-- para que cada miembro vea también su propio tiempo trabajado.
-- ============================================================

create policy "Owners can view their workspace"
  on workspaces for select
  using (auth.uid() = owner_id);

create policy "Owners can update their workspace"
  on workspaces for update
  using (auth.uid() = owner_id);

create policy "Owners can view their members"
  on workspace_members for select
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "Owners can manage their members"
  on workspace_members for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "Owners can view their projects"
  on projects for select
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "Owners can manage their projects"
  on projects for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "Owners can view assignments"
  on project_assignments for select
  using (
    project_id in (
      select p.id from projects p
      join workspaces w on w.id = p.workspace_id
      where w.owner_id = auth.uid()
    )
  );

create policy "Owners can manage assignments"
  on project_assignments for all
  using (
    project_id in (
      select p.id from projects p
      join workspaces w on w.id = p.workspace_id
      where w.owner_id = auth.uid()
    )
  );

create policy "Owners can view time entries"
  on time_entries for select
  using (
    project_id in (
      select p.id from projects p
      join workspaces w on w.id = p.workspace_id
      where w.owner_id = auth.uid()
    )
  );

create policy "Owners can manage time entries"
  on time_entries for all
  using (
    project_id in (
      select p.id from projects p
      join workspaces w on w.id = p.workspace_id
      where w.owner_id = auth.uid()
    )
  );

-- CineLog – Schema SQL
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de perfiles de usuario
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- Tabla principal del catálogo
create table public.catalog (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type text not null check (type in ('movie', 'series')),
  status text not null check (status in ('watching', 'completed', 'wishlist', 'dropped')),
  rating integer check (rating >= 1 and rating <= 10),
  review text,
  poster_url text,
  genre text,
  year integer,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- Habilitar Row Level Security
alter table public.profiles enable row level security;
alter table public.catalog enable row level security;

-- Políticas para profiles
create policy "Usuarios pueden ver su propio perfil"
  on public.profiles for select using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil"
  on public.profiles for update using (auth.uid() = id);

create policy "Usuarios pueden insertar su propio perfil"
  on public.profiles for insert with check (auth.uid() = id);

-- Políticas para catalog
create policy "Usuarios pueden ver su propio catálogo"
  on public.catalog for select using (auth.uid() = user_id);

create policy "Usuarios pueden insertar en su catálogo"
  on public.catalog for insert with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar su catálogo"
  on public.catalog for update using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar de su catálogo"
  on public.catalog for delete using (auth.uid() = user_id);

-- Función que crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que ejecuta la función al crear un usuario
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

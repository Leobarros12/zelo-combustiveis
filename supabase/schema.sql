create table stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table fuel_prices (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references stations(id) on delete cascade,
  fuel_type text not null,
  price numeric,
  updated_at timestamp with time zone default now()
);

create table price_reports (
  id uuid primary key default gen_random_uuid(),
  station_id uuid references stations(id) on delete cascade,
  fuel_type text not null,
  reported_price numeric,
  created_at timestamp with time zone default now()
);

-- Indexes for fast lookup
create index idx_fuel_prices_station on fuel_prices(station_id);
create index idx_price_reports_station on price_reports(station_id);

-- decks
create table decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- cards
create table cards (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references decks(id) on delete cascade,
  front      text not null,
  back       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- quizzes
create table quizzes (
  id           uuid primary key default gen_random_uuid(),
  deck_id      uuid not null references decks(id) on delete cascade,
  card_id      uuid references cards(id) on delete set null,
  question     text not null,
  choices      text[] not null,
  answer_index integer not null check (answer_index between 0 and 3),
  created_at   timestamptz not null default now()
);

-- review_logs（追記専用）
create table review_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     uuid not null references cards(id) on delete cascade,
  result      text not null check (result in ('correct', 'incorrect')),
  study_mode  text not null check (study_mode in ('flashcard', 'quiz')),
  reviewed_at timestamptz not null default now()
);

-- source_inputs（生成元の記録）
create table source_inputs (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references decks(id) on delete cascade,
  input_type text not null check (input_type in ('text', 'url')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- インデックス
create index idx_cards_deck_id        on cards(deck_id);
create index idx_quizzes_deck_id      on quizzes(deck_id);
create index idx_review_logs_card_id  on review_logs(card_id);
create index idx_review_logs_user_id  on review_logs(user_id);
create index idx_source_inputs_deck   on source_inputs(deck_id);

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_decks_updated_at
  before update on decks
  for each row execute function update_updated_at();

create trigger trg_cards_updated_at
  before update on cards
  for each row execute function update_updated_at();

-- RLS 有効化
alter table decks        enable row level security;
alter table cards        enable row level security;
alter table quizzes      enable row level security;
alter table review_logs  enable row level security;
alter table source_inputs enable row level security;

-- decks ポリシー
create policy "decks: owner full access"
  on decks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "decks: public read"
  on decks for select
  using (is_public = true);

-- cards ポリシー
create policy "cards: access through deck ownership"
  on cards for all
  using (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from decks
      where decks.id = cards.deck_id
        and decks.user_id = auth.uid()
    )
  );

-- quizzes ポリシー
create policy "quizzes: access through deck ownership"
  on quizzes for all
  using (
    exists (
      select 1 from decks
      where decks.id = quizzes.deck_id
        and decks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from decks
      where decks.id = quizzes.deck_id
        and decks.user_id = auth.uid()
    )
  );

-- review_logs ポリシー（SELECT + INSERT のみ。UPDATE/DELETE は不可）
create policy "review_logs: owner select"
  on review_logs for select
  using (user_id = auth.uid());

create policy "review_logs: owner insert"
  on review_logs for insert
  with check (user_id = auth.uid());

-- source_inputs ポリシー
create policy "source_inputs: access through deck ownership"
  on source_inputs for all
  using (
    exists (
      select 1 from decks
      where decks.id = source_inputs.deck_id
        and decks.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from decks
      where decks.id = source_inputs.deck_id
        and decks.user_id = auth.uid()
    )
  );

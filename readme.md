# My Screen Time

Mobilna aplikacja webowa w Next.js 16.1.6 do zbierania i analizowania czasu przed ekranem z prostym panelem administratora opartym o Supabase Auth.

## Stack

- Next.js 16.1.6
- React 19
- Supabase z kluczami `publishable` i `secret`
- Firebase App Hosting

## Co jest gotowe

- Strona dla użytkownika bez logowania.
- Automatyczne wykrywanie systemu: iOS, Android, Windows, macOS, Linux lub `unknown`.
- Instrukcje, skrót do ustawień systemowych oraz formularz wpisania czasu przed ekranem.
- Zapisywanie wpisów do Supabase z danymi: `uuid`, `session_id`, `screen_time_minutes`, `date`, `time`, `ip`, `os`, `user_agent`.
- Sesja użytkownika oparta o cookie, bez konta i bez logowania.
- Panel `/admin` z logowaniem tylko dla administratorów.
- Zapraszanie nowych administratorów przez Supabase Auth z poziomu panelu.
- `schema.sql` dla schematu `screentime`.
- Konfiguracja `apphosting.yaml` pod Firebase App Hosting.

## Ważne założenie Supabase

Aplikacja używa wyłącznie własnych tabel i widoków w schemacie `screentime`.
Jedyny wyjątek to wbudowany system Supabase Auth, który technicznie działa w zarządzanym schemacie `auth` i tego nie da się ominąć.

## Konfiguracja lokalna

1. Uzupełnij wartości w `.env.local`.
2. W Supabase uruchom `schema.sql`.
3. W `API Settings` dodaj `screentime` do `Exposed schemas`.
4. Utwórz pierwszego użytkownika administratora w Supabase Auth.
5. Nadaj mu rolę poleceniem:

```sql
select screentime.bootstrap_admin('twoj-admin@example.com');
```

6. Zainstaluj zależności i uruchom dev server:

```bash
npm install
npm run dev
```

## Firebase App Hosting

W `apphosting.yaml` są już przygotowane zmienne i sekrety. Przed rolloutem ustaw w Firebase / Secret Manager:

- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

oraz popraw wartości URL aplikacji i projektu Supabase.

## Benchmark dla wyniku

Aplikacja używa orientacyjnego limitu `120 minut` dziennie dla rekreacyjnego screen time u młodzieży 12-17 lat. To bazuje na zaleceniach Canadian 24-Hour Movement Guidelines.
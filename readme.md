# My Screen Time

Mobilna aplikacja webowa w Next.js 16.1.6 do zbierania i analizowania czasu przed ekranem z publiczną rejestracją użytkowników, własnymi sesjami i panelem administratora opartym o Supabase Auth.

## Stack

- Next.js 16.1.6
- React 19
- Supabase z kluczami `publishable` i `secret`
- Firebase App Hosting

## Co jest gotowe

- Strona dla użytkownika bez logowania.
- Publiczna rejestracja i logowanie użytkowników w `/account/register` oraz `/account/login`.
- Automatyczne tworzenie organizacji dla nowego właściciela i role `owner` / `member`.
- Panel `/panel` do tworzenia własnych sesji, podglądu live danych i zarządzania członkami organizacji.
- Publiczne strony `/session/[slug]` do wpisywania czasu przed ekranem dla konkretnej sesji.
- Link publiczny i kod QR dla każdej utworzonej sesji.
- Zapraszanie nowych użytkowników do organizacji przez Supabase Auth.
- Automatyczne wykrywanie systemu: iOS, Android, Windows, macOS, Linux lub `unknown`.
- Zapisywanie wpisów do Supabase z danymi: `uuid`, `tracked_session_id`, `session_id`, `screen_time_minutes`, `entry_date`, `ip`, `os`, `user_agent`.
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
4. Ustaw redirecty auth dla użytkowników i administratorów.
5. Utwórz pierwszego użytkownika administratora w Supabase Auth.
6. Nadaj mu rolę poleceniem:

```sql
select screentime.bootstrap_admin('twoj-admin@example.com');
```

7. Zainstaluj zależności i uruchom dev server:

```bash
npm install
npm run dev
```

## Zmienne środowiskowe

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ADMIN_INVITE_REDIRECT_URL`
- `USER_INVITE_REDIRECT_URL`
- `NEXT_PUBLIC_RECOMMENDED_DAILY_LIMIT_MINUTES`
- `NEXT_PUBLIC_SESSION_COOKIE_NAME`

## Firebase App Hosting

W `apphosting.yaml` są już przygotowane zmienne i sekrety. Przed rolloutem ustaw w Firebase / Secret Manager:

- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

oraz popraw wartości URL aplikacji i projektu Supabase.

## Benchmark dla wyniku

Aplikacja używa orientacyjnego limitu `120 minut` dziennie dla rekreacyjnego screen time u młodzieży 12-17 lat. To bazuje na zaleceniach Canadian 24-Hour Movement Guidelines.

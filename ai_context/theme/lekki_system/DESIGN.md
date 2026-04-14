# Dokumentacja Systemu Projektowego (Design System)

## 1. Wizja Projektowa & Creative North Star: "Aura Clarity"

Ten system projektowy odchodzi od sztywnych, tabelarycznych układów na rzecz podejścia **"Digital Sanctuary"**. Naszym celem nie jest po prostu wyświetlanie danych, ale tworzenie przestrzeni, która oddycha. Wykorzystujemy asymetrię, głębię tonalną i ekstremalne zaokrąglenia, aby interfejs był postrzegany jako przyjazny, "miękki" i luksusowy w swojej prostocie.

**Creative North Star: "Eteryczna Struktura"**
Interfejs musi sprawiać wrażenie lewitujących warstw matowego szkła zanurzonych w czystym, porannym świetle. Unikamy wszystkiego, co sprawia wrażenie "ciężkiego" lub "technicznego".

---

## 2. Kolorystyka i Tekstura

System opiera się na subtelnych przejściach tonalnych. Zamiast rysować granice, pozwalamy kolorom tła definiować strukturę.

### Paleta Barw (Wybrane Tokeny)
*   **Główne Tło (`surface`):** `#f5f7f9` – Podstawa wszystkiego, dająca poczucie czystości.
*   **Akcenty (`primary`):** `#006478` oraz `#66defe` (`primary_container`). Używamy ich do prowadzenia wzroku użytkownika.
*   **Głęboka Czerń (`on_surface`):** `#2c2f31` – Nigdy nie używamy czystego `#000000`. Nasza czerń jest miękka i antracytowa.

### Zasada "No-Line" (Zakaz Linii)
Kategorycznie zabrania się używania 1px stałych obramowań (borders) do oddzielania sekcji. Granice definiujemy poprzez:
*   **Zmianę Tonu:** Umieszczenie elementu `surface_container_low` na tle `surface`.
*   **Nesting (Zagnieżdżanie):** Warstwy układamy jak arkusze papieru. Najniższa warstwa to tło, najwyższa to białe karty (`surface_container_lowest`).

### Szklane Wykończenie (Glassmorphism)
Dla elementów pływających (modale, dropdowny) stosujemy efekt **frosted glass**:
*   Tło: `surface_container_lowest` z przezroczystością 80%.
*   Efekt: `backdrop-filter: blur(20px)`.
*   To sprawia, że interfejs staje się integralną całością, a nie zbiorem naklejonych pudełek.

---

## 3. Typografia: Inter Editorial

Wykorzystujemy czcionkę **Inter** w skali, która promuje hierarchię informacyjną poprzez kontrast wielkości, a nie tylko wagę fontu.

*   **Display (lg/md/sm):** Wykorzystywane do wielkich, "redakcyjnych" nagłówków (2.25rem - 3.5rem). Zawsze z ujemnym letter-spacingiem (-0.02em), aby nadać im charakter premium.
*   **Headline & Title:** Służą do szybkiego skanowania treści. Używamy ich oszczędnie, by nie przytłoczyć użytkownika.
*   **Body (lg/md/sm):** Nasz koń roboczy. `body-lg` (1rem) to standard dla czytelności.
*   **Język:** Wszystkie komunikaty projektujemy w języku polskim, dbając o unikanie "sierotek" na końcach linii i odpowiednią odmianę (np. "2 powiadomienia", "5 powiadomień").

---

## 4. Głębia i Warstwowość (Elevation)

Głębię budujemy światłem i kolorem, a nie cieniem.

*   **Tonal Layering:** Zamiast cieni, używamy hierarchii kontenerów:
    1.  Poziom 0: `surface` (Tło strony)
    2.  Poziom 1: `surface_container_low` (Sekcje boczne)
    3.  Poziom 2: `surface_container_lowest` (Główne karty – czysta biel)
*   **Ambient Shadows:** Cień dopuszczalny jest tylko dla elementów interaktywnych (hover) lub modali. Musi być bardzo rozproszony: `box-shadow: 0 20px 40px rgba(44, 47, 49, 0.06)`. Kolor cienia to zawsze przyciemniony odcień tła, nigdy szary.
*   **Ghost Border:** Jeśli dostępność (WCAG) wymaga obramowania, używamy `outline_variant` z 15% krycia. Ma być niemal niewidoczny, jak "duch" linii.

---

## 5. Komponenty

Wszystkie komponenty muszą posiadać zaokrąglenia zgodne ze skalą: **Default: 1rem (16px)**, **XL: 3rem (48px)** dla dużych kart.

*   **Przyciski (Buttons):**
    *   *Primary:* Wypełniony `primary` z białym tekstem. Zaokrąglenie `full`.
    *   *Secondary:* Kolor `secondary_container` bez obramowania. Miękki, przyjazny klik.
*   **Pola Wprowadzania (Input Fields):**
    *   Brak dolnej kreski. Tło `surface_container_high`, zaokrąglenie `md`. Etykiety zawsze nad polem, pisane `label-md`.
*   **Karty (Cards):**
    *   **ZAKAZ** stosowania linii oddzielających (dividers). Treść oddzielamy za pomocą `spacing scale` (np. 32px odstępu) lub subtelnej zmiany koloru tła wewnątrz karty.
*   **Chips (Tagi):**
    *   Małe, eliptyczne formy używające `tertiary_container` dla podkreślenia statusu "friendly".
*   **Listy:**
    *   Interlinia musi być o 20% większa niż standardowa, aby wzmocnić efekt "lite".

---

## 6. Do’s and Don’ts (Zasady Dobrego Stylu)

| Co robić (Do) | Czego unikać (Don't) |
| :--- | :--- |
| **Używaj bieli jako aktywnego elementu projektu.** Biel to nie brak treści, to luksusowa przestrzeń. | **Nie używaj cienkich, czarnych linii** do separacji modułów. To niszczy nowoczesny look. |
| **Stosuj zaokrąglenia XL (3rem)** dla głównych kontenerów, by nadać im organiczny kształt. | **Nie stosuj ostrych narożników.** System ma być przyjazny i bezpieczny w odbiorze. |
| **Grupuj elementy poprzez wspólne tło.** | **Nie bój się pustej przestrzeni.** Jeśli sekcja wydaje się pusta, dodaj więcej marginesu, zamiast ją zapełniać. |
| **Personalizuj komunikaty po polsku.** Zamiast "Error", użyj "Coś poszło nie tak, spróbujmy jeszcze raz". | **Nie używamy standardowych cieni systemowych.** Każdy cień musi być miękki jak mgła. |

---

## 7. Dodatkowe Wskazówki Editorial

Aby system czuł się "Premium", wprowadź asymetrię w sekcjach Hero. Przykładowo: tekst wyrównany do lewej w kontenerze o szerokości 60%, a po prawej stronie "pływająca" karta z dużym zaokrągleniem, która lekko nachodzi na sąsiednią sekcję. To przełamuje nudę siatki i nadaje aplikacji autorski sznyt.
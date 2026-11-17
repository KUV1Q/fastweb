# INFORMACJE OGÓLNE

### **TWÓRCA** : JA

### **TYTUŁ APLIKACJI (WEB)** : Fast web formularze

### **OPIS** : Aplikacja służąca do szybkiego przesyłania zgłoszeń i formularzy poprzez stronę HTML5 bezpośrednio do lokalnej bazy danych (JSON) bez szyfrowania, przy użyciu czystego JavaScriptu (Vanilla JS + Node.js).

# DEV INFO

### **FRONTEND** - HTML5, CSS3 (modułowe arkusze stylów), JavaScript (Fetch API, obsługa DOM)

### **BACKEND** - JavaScript (czysty Node.js – wbudowane moduły `http`, `fs/promises`, `path`)

### **DB** - JSON (`data/db.json` - bez szyfrowania, z kolejkowaniem zapisu)

# PORADNIK ODPALENIA APLIKACJI

1. Otwórz kod źródłowy **Fast web formularze** w programie przystosowanym do edycji kodu (np. **Visual Studio Code**).
2. Brak wymaganych zewnętrznych bibliotek (`node_modules`) – uruchom serwer za pomocą skryptu npm: `npm run dev` (lub bezpośrednio `node server.js`).
   - **2.1** Plik `data/db.json` utworzy się automatycznie przy starcie serwera i zainicjuje strukturę `{ "ostatnie_id": 0, "formularze": [] }`.
   - **2.2** Jeśli serwer nie chce się uruchomić, upewnij się, że znajdujesz się w folderze głównym aplikacji `projekt` (`cd projekt`).
   - **2.3** Panel webowy uruchomi się pod adresem `localhost:2225` (lub `127.0.0.1:2225`). Port jest rzadko używany, lecz jeśli jest zajęty (`Port 2225 jest zajęty`), zamknij proces działający na porcie 2225 przez terminal/CMD albo zmień wartość stałej `PORT` w pliku `server.js`.
3. Uruchom stronę w przeglądarce:
   - Wpisz adres: `http://localhost:2225` lub `http://127.0.0.1:2225`.
   - Zostaniesz powitany na stronie głównej (`index.html`), skąd przyciskiem **Wypełnij formularz** lub przez rozwijane menu w prawym górnym rogu przejdziesz do podstrony `formularz.html`.
   - > **4. BRAK ZAŁADOWANEGO CSS?** – Upewnij się, że otwierasz stronę przez serwer Node.js (`http://localhost:2225`), a nie bezpośrednio z pliku na dysku, oraz że przeglądarka poprawnie ładuje arkusze stylów (sprawdzisz to w konsoli deweloperskiej pod klawiszem `F12`).

## WSZYSTKO GOTOWE – przetestuj stronę, wypełniając zgłoszenie na podstronie formularza. Dane pojawią się natychmiast w pliku `projekt/data/db.json`.

# DOKŁADNY OPIS APLIKACJI

### Aplikacja została zaprojektowana z myślą o szybkim przesyłaniu zgłoszeń problemowych do pliku JSON bez szyfrowania. Nie jest przystosowana do gromadzenia danych poufnych lub wrażliwych - podawanie takich informacji może grozić ich wyciekiem. Ponieważ format JSON nie jest optymalizowany pod kątem obsługi masowych baz danych, aplikacja służy do prywatnego przesyłania lokalnych formularzy w zakresie własnych potrzeb.

Ułatwia ona zapisywanie i kategoryzację informacji:

- Strona automatycznie segreguje formularze, nadając im unikalne `id`, kolejne numery (`#1`, `#2`, `#3` itd.) oraz dokładny znacznik czasu (`data` w formacie ISO).
- Wystarczy odszukać w pliku `db.json` numer swojego formularza lub jego tytuł za pomocą skrótu `Ctrl + F` (domyślnie w VS Code).
- Skrypt kliencki `scripts/wyslij.js` przechwytuje dane z pól formularza na podstronie `formularz.html`, przeprowadza wstępną walidację, serializuje je do formatu JSON i wysyła asynchronicznie (`fetch`) metodą `POST` pod adres `/api/formularze`.
- Serwer `server.js` weryfikuje poprawność danych po stronie backendu, kolejkuje operacje zapisu (`lock`), dopisuje zgłoszenie do `data/db.json` oraz pełni funkcję serwera plików statycznych i REST API.

## **W CZYM POMAGA APLIKACJA**

### Ułatwia sortowanie oraz zarządzanie bieżącymi zgłoszeniami i prostymi danymi na użytek prywatny. Zapis odbywa się bez przeładowania strony prosto do pliku JSON, z natychmiastowym komunikatem zwrotnym dla użytkownika.

## Przeznaczenie :

### Dedykowana dla użytkowników indywidualnych (dla małych grup do maksymalnie 5 osób) w celach ściśle prywatnych. Korzystanie z niej w zastosowaniach komercyjnych może rodzić ograniczenia wydajnościowe i bezpieczeństwa.

# KONCEPT APLIKACJI

### Ciemny, minimalistyczny interfejs podzielony na stronę powitalną (`index.html`), trzykolumnowy formularz zgłoszeniowy (`formularz.html`) oraz przygotowaną podstronę bazy danych (`baza.html`). Nawigację zapewnia rozwijane menu hamburgerowe obsługiwane przez `scripts/select_menu.js`, a spójny wygląd utrzymują dedykowane arkusze stylów CSS.

# GŁÓWNE FUNKCJE APLIKACJI

- **Rozbudowany formularz zgłoszeniowy (`formularz.html`):**
  - **Sekcja menu (lewy panel):** Wybór rodzaju problemu (`Ciężki`, `Umiarkowany`, `Łatwy`), skali problemu (`Duża`, `Średnia`, `Umiarkowana`) oraz opcji dodatkowych (checkboxy: `Potrzeba >1 osoby`, `Możliwość zdalna`).
  - **Opisy (środkowy panel):** Krótki tytuł zgłoszenia (wymagany, do 150 znaków) oraz dokładny opis problemu (wymagany, do 5000 znaków).
  - **Zakończenie (prawy panel):** Opcjonalne pole na adres e-mail do kontaktu z walidacją formatu.
- **Asynchroniczna wysyłka i walidacja (`wyslij.js`):** Wysyłanie danych przez Fetch API bez odświeżania strony, dynamiczne komunikaty o statusie (zielony sukces z numerem zgłoszenia np. `#1` lub czerwony komunikat błędu) oraz blokada przycisku podczas wysyłania.
- **Autorski serwer HTTP i REST API (`server.js`):**
  - `GET /api/formularze` – pobieranie listy wszystkich zapisanych formularzy.
  - `POST /api/formularze` – walidacja i dodawanie nowego zgłoszenia do bazy.
  - `DELETE /api/formularze/:id` – usuwanie wybranego formularza po jego identyfikatorze.
  - Kolejkowanie zapisu (`Promise` lock) chroniące plik `db.json` przed uszkodzeniem przy jednoczesnych żądaniach oraz zabezpieczenie przed atakami typu Path Traversal i zbyt dużym payloadem (limit 100 KB).

# STRUKTURA PROJEKTU

```text
fstwb/
│
├── package.json          # Konfiguracja projektu i skrypt startowy (npm run dev)
├── server.js             # Serwer HTTP (Node.js) oraz obsługa REST API i zapisu do bazy
├── main/                 # Podstrony HTML aplikacji
│   ├── index.html        # Strona główna (powitalna) z przekierowaniem do formularza
│   ├── formularz.html    # Podstrona z właściwym formularzem zgłoszeniowym
│   └── baza.html         # Podstrona pod podgląd bazy danych (w przygotowaniu)
├── styles/               # Modułowe arkusze stylów CSS
│   ├── style.css         # Style globalne (tło, czcionki, układ strony)
│   ├── header.css        # Stylizacja nagłówka i rozwijanego menu (hamburger)
│   ├── main.css          # Style dedykowane dla strony głównej (index.html)
│   ├── formularz.css     # Stylizacja 3-kolumnowego formularza, pól input i komunikatów
│   └── stupka.css        # Stylizacja stopki na wszystkich podstronach
├── scripts/              # Skrypty JavaScript po stronie klienta (Frontend)
│   ├── select_menu.js    # Obsługa otwierania i zamykania menu nawigacyjnego
│   └── wyslij.js         # Walidacja formularza i wysyłka danych (POST /api/formularze)
└── data/                 # Katalog bazy danych
    └── db.json           # Lokalna baza danych przechowująca zapisane formularze
```

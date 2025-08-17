# Dokument wymagań produktu (PRD) - Planer AI wspomagany LLM

## 1. Przegląd produktu

Planer AI wspomagany LLM to narzędzie umożliwiające użytkownikom szybkie i efektywne rozbijanie złożonych celów lub problemów na konkretne zadania i podzadania. Dzięki integracji z dużym modelem językowym (LLM) użytkownik otrzymuje wstępne propozycje kroków do wykonania, które może zaakceptować, edytować. Aplikacja wspiera zarządzanie jedną główną listą zadań z możliwością dwupoziomowego zagnieżdżenia, oferując prosty system kont oraz sesje generowania AI.

## 2. Problem użytkownika

Użytkownicy często planują zadania ogólnikowo, nie rozbijając złożonych celów na mniejsze kroki. To prowadzi do frustracji, wydłużonego czasu realizacji i rezygnacji. Potrzebują narzędzia, które:

* przytoczy wyraźne, sekwencyjne kroki do realizacji celu
* pozwoli iteracyjnie doprecyzować i rozbić propozycje
* umożliwi zachowanie pełnej listy zadań z możliwością zarządzania statusami

## 3. Wymagania funkcjonalne

3.1. Sesja planowania AI

* F1: użytkownik otwiera modal planowania i wpisuje opis celu/problemu
* F2: walidacja inputu pod kątem relewantności i złożoności przez LLM; w razie konieczności zwraca komunikat o błędzie i ogólne wskazówki
* F3: po kliknięciu przycisku "Generuj zadania" i po walidacji następuje wywołanie API LLM które generuje 4–8 propozycji zadań
* F4: sesja trwa do momentu akceptacji lub odrzucenia; stan sesji jest przechowywany przy zamknięciu modalu

3.2. Zarządzanie zadaniami

* F5: wyświetlanie głównej listy zadań z możliwością zagnieżdżania podzadań do 2 poziomów
* F6: CRUD zadań i podzadań: dodawanie, edytowanie, usuwanie (limit 10 zadań 1. poziomu)
* F7: oznaczanie dowolnego zadania lub podzadania jako ukończone

3.3. Akceptacja i edycja propozycji AI

* F8: każda propozycja zadania może zostać ręcznie edytowana
* F10: usunięcie pojedynczej propozycji bez wpływu na inne, chyba ze posiada podzadania. Wtedy usunięcie zadania usuwa równiez podzadania
* F11: jednoprzyciskowa akcja "Akceptuj" akceptuje wszystkie propozycje i zapisuje je do głównej listy jako zadanie z pozadaniami
* F12: akcja "Odrzuć" uruchamia modal potwierdzenia zakończenia sesji; odrzucone zadania są bezpowrotnie usuwane

3.4. Konta i uwierzytelnianie

* F13: prosty system rejestracji i logowania (email + hasło)
* F14: zabezpieczenie dostępu do sesji i zadań wyłącznie dla zalogowanego użytkownika
* F15: możliwość usunięcia konta i powiązanych fiszek na życzenie

## 4. Granice produktu

* B1: brak wielokrotnych list; ograniczenie do jednej głównej listy
* B2: brak funkcji filtracji, sortowania, przeciągania zadań
* B3: brak planowania terminów i priorytetyzacji
* B4: brak dedykowanej opcji "ponów generowanie" (użytkownik musi ponownie wprowadzić opis)

## 5. Historyjki użytkowników

US-001  Tytuł: Rejestracja nowego użytkownika
Opis: Jako nowy użytkownik chcę założyć konto, aby zabezpieczyć dostęp do moich zadań.
Kryteria akceptacji:

* formularz rejestracji z polami email i hasło na dedykowanej podstronie
* walidacja formatu email i minimalnej długości hasła
* konto tworzone w bazie danych (supabase auth)
* mail z potwierdzeniem zalozenia konta
* przekierowanie do widoku listy po udanej rejestracji

US-002  Tytuł: Logowanie użytkownika
Opis: Jako zarejestrowany użytkownik chcę się zalogować, aby uzyskać dostęp do moich zadań.
Kryteria akceptacji:

* formularz logowania z pola email i hasło na dedykowanej podstronie
* uwierzytelnianie poprzez backend (supabase auth)
* obsługa niepoprawnych danych (komunikat o błędzie)
* przekierowanie do widoku listy po pomyślnym logowaniu 
* niezalogowany uzytkownik trafia na stronę logowania gdzie moze się zalogować lub przejść do widoku rejestracji
* wszystkie widoki poza widokami sluzącymi do logowania i rejestracji powinny być dostępne jedynie dla zalogowanych uzytkowników
* uzytkownik moze wylogować się po wejściu na widok profilu uzytkownika

US-003  Tytuł: Rozpoczęcie sesji planowania AI
Opis: Jako użytkownik chcę wpisać opis celu lub problemu i kliknąć "Generuj zadania", aby uzyskać propozycje od AI.
Kryteria akceptacji:

* modal zawierający pole opisu i przycisk
* walidacja inputu przed generowaniem zadań lecz po naciśnięciu przycisku "Generuj zadania" 
* wywołanie API LLM zwraca 4–8 propozycji

US-004  Tytuł: Wznowienie sesji planowania
Opis: Jako użytkownik chcę móc zamknąć modal i wrócić do trwającej sesji, aby kontynuować edycję propozycji.
Kryteria akceptacji:

* stan propozycji zapisany lokalnie lub w bazie
* otwarcie modalu przywraca ostatni stan sesji

US-005  Tytuł: Edycja pojedynczej propozycji
Opis: Jako użytkownik chcę edytować tytuł lub opis wygenerowanego zadania, aby dopasować je do własnych potrzeb.
Kryteria akceptacji:

* edycja pola tekstowego dla wybranej propozycji
* zapis zmian w sesji bez utraty innych danych

US-007  Tytuł: Usunięcie pojedynczej propozycji
Opis: Jako użytkownik chcę usunąć wybrane zadanie z propozycji, aby nie trafiło do głównej listy zadań przy akceptacji.
Kryteria akceptacji:

* przycisk usuń przy każdej propozycji
* usunięcie natychmiastowe, bez wpływu na pozostałe

US-008  Tytuł: Akceptacja wszystkich propozycji
Opis: Jako użytkownik chcę zaakceptować wszystkie wygenerowane propozycje jednym przyciskiem, aby dodać je do głównej listy.
Kryteria akceptacji:

* przycisk "Akceptuj" aktywny po wygenerowaniu
* wszystkie pozostałe propozycje zapisywane jako zadania
* zamknięcie sesji planowania

US-009  Tytuł: Odrzucenie sesji planowania
Opis: Jako użytkownik chcę móc odrzucić całą sesję, aby usunąć wszystkie propozycje.
Kryteria akceptacji:

* przycisk "Odrzuć" otwiera modal potwierdzenia
* wybór "Zakończ" usuwa wszystkie propozycje
* wybór "Kontynuuj" zamyka modal i pozostawia sesję

US-010  Tytuł: Dodawanie nowego zadania lub podzadania ręcznie
Opis: Jako użytkownik chcę dodać własne zadanie lub podzadanie do głównej listy, aby uwzględnić niestandardowe kroki.
Kryteria akceptacji:

* przycisk "Nowe zadanie" na górze widoku listy w przypadku zadania lub ikona z plusem na istniejącym już zadaniu lub podzadaniu 1. stopnia
* formularz z polami tytuł i opis
* zapis nowego zadania w bazie

US-011  Tytuł: Edycja zadania lub podzadania w liście
Opis: Jako użytkownik chcę modyfikować tytuł i opis istniejącego zadania lub podzadania.
Kryteria akceptacji:

* możliwość wejścia w tryb edycji po kliknięciu ikony edycji
* zapis zmian w bazie

US-012  Tytuł: Usunięcie zadania lub podzadania z listy
Opis: Jako użytkownik chcę usunąć niepotrzebne zadanie lub podzadanie z listy.
Kryteria akceptacji:

* przycisk usuń przy każdym elemencie
* potwierdzenie przed usunięciem
* usunięcie z bazy i interfejsu
* usunięcie zadania usuwa powiązane z nim podzadania

US-013  Tytuł: Oznaczenie zadania jako ukończone
Opis: Jako użytkownik chcę oznaczyć zadanie lub podzadanie jako ukończone, aby śledzić postęp.
Kryteria akceptacji:

* checkbox przy każdej pozycji
* zapis statusu ukończenia w bazie
* ukończenie zadania sprawia, ze jego podzadania równiez zostały ukończone

## 6. Metryki sukcesu

* M1: 75 procent zadań w głównej liście wygenerowanych przez AI (flaga ai\_generated = true)
* M2: 75 procent wygenerowanych propozycji zaakceptowanych bez modyfikacji (edited\_at = null)


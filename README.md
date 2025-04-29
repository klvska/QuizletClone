# Quizlet Clone

Klon popularnej aplikacji Quizlet do nauki poprzez fiszki i quizy.

## Technologie

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- Prisma (ORM)
- SQLite
- JWT (autentykacja)

## Wymagania

- Node.js (wersja 18 lub nowsza)
- npm (wersja 9 lub nowsza)

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/your-username/QuizletClone.git
cd QuizletClone
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj bazę danych:
```bash
# Wykonaj migracje bazy danych
npx prisma migrate dev
```

## Uruchomienie aplikacji

1. Uruchom aplikację:
```bash
npm run dev
```

2. Otwórz przeglądarkę i przejdź pod adres:
```
http://localhost:5173
```

## Funkcjonalności

- Tworzenie i zarządzanie zestawami fiszek
- Różne tryby nauki:
  - Tryb nauki
  - Quizy
  - Testy
- Statystyki nauki
- Osiągnięcia
- Kalendarz aktywności
- Współdzielenie zestawów

## Struktura projektu

```
QuizletClone/
├── src/                    # Frontend
│   ├── components/         # Komponenty React
│   ├── pages/             # Strony aplikacji
│   ├── App.jsx            # Główny komponent
│   └── main.jsx           # Punkt wejścia
├── server/                # Backend
│   ├── prisma/           # Konfiguracja Prisma
│   ├── server.js         # Serwer Express
│   └── package.json      # Zależności backendu
└── package.json          # Zależności frontendu
```

## Kontrybucja

1. Forkuj repozytorium
2. Utwórz nową gałąź (`git checkout -b feature/nowa-funkcjonalnosc`)
3. Zatwierdź zmiany (`git commit -am 'Dodaj nową funkcjonalność'`)
4. Wypchnij zmiany (`git push origin feature/nowa-funkcjonalnosc`)
5. Utwórz Pull Request

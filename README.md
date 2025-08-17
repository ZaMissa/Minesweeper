# 🎯 Blagoje Minesweeper

Moderna web verzija klasične Minesweeper igre sa naprednim funkcionalnostima i magičnim moćima!

## 🌟 Funkcionalnosti

### 🎮 Osnovna Igra
- **Tri nivoa težine**: Početnički, Srednji, Napredni
- **Inteligentno postavljanje mina**: Prvi klik je uvek siguran
- **Sistem zastavica**: Obeležavanje sumnjivih polja
- **Chording sistem**: Otkrivanje susednih polja sa zastavicama
- **Timer i brojač mina**: Praćenje vremena i preostalih mina

### 🎨 Vizuelni Efekti
- **Dark/Light tema**: Automatsko prebacivanje između tema
- **Kamen tekstura**: Realistična tekstura za neotvorena polja
- **Animacije**: Hover efekti, klikovi, potresanje, pulsiranje
- **Konfeti**: Slavljenje pobede sa lepim efektima
- **Custom kursor**: Animirani ključ umesto standardnog kursora

### 🔊 Zvučni Efekti
- **Zvučni efekti**: Otkrivanje polja, zastavice, mine, pobeda
- **Intenzivni zvukovi**: Dramatični zvukovi za bombe i game over
- **Toggle opcija**: Uključivanje/isključivanje zvuka

### 📊 Statistike i Dostignuća
- **Detaljne statistike**: Ukupno igara, pobede, porazi, win rate
- **Najbolja vremena**: Praćenje najboljih rezultata po nivou
- **Progress bar**: Vizuelni prikaz napretka
- **Magične moći**: Otključavanje novih sposobnosti

### 🎯 Magične Moći
- **Magična Intuicija**: Otkriva 3 mine (5 igara)
- **Vremenska Kontrola**: Zamrzava timer (10 igara)
- **Magična Aura**: Otkriva 5 sigurnih polja (15 igara)
- **Savršenstvo**: Bonus bodovi za savršene igre (20 igara)
- **Gospodar Mina**: Otključava magične nivoe (30 igara)
- **Magični Niz**: Otključava sve nivoe (50 igara)

### 🎲 Mini-Igra
- **"Sa čim krcamo orase"**: Pojavljuje se svaki drugi put
- **Interaktivna**: Pitanja i odgovori sa animacijama
- **Statistike**: Praćenje uspešnosti u mini-igri

### 📱 Responsive Dizajn
- **Desktop optimizacija**: Puna funkcionalnost na velikim ekranima
- **Mobilna podrška**: Touch gestovi i optimizovani UI
- **Adaptivni layout**: Automatsko prilagođavanje različitim rezolucijama

## 🚀 Kako Pokrenuti

1. **Klonirajte repozitorijum**:
   ```bash
   git clone [repository-url]
   cd "Blagoje Minesweeper"
   ```

2. **Pokrenite server**:
   ```bash
   python -m http.server 8000
   ```

3. **Otvorite u browseru**:
   ```
   http://localhost:8000
   ```

## 🎮 Kako Igrati

### Osnovna Pravila
- **Levi klik**: Otkriva polje
- **Desni klik**: Postavlja/uklanja zastavicu
- **Chording**: Klik na otvoreno polje sa brojem otkriva susedna polja ako su sve mine obeležene

### Strategije
- **Počnite sa uglovima**: Veća šansa za otkrivanje praznih polja
- **Koristite logiku**: Brojevi pokazuju koliko mina je u susedstvu
- **Označite sumnjiva polja**: Zastavice pomažu u planiranju
- **Chording**: Efikasno otkrivanje više polja odjednom

### Magične Moći
- **Otključavajte ih igranjem**: Svaka igra donosi napredak
- **Kombinujte moći**: Različite moći se mogu koristiti zajedno
- **Planirajte unapred**: Koristite moći u kritičnim momentima

## 🛠️ Tehnologije

- **HTML5**: Semantička struktura
- **CSS3**: Napredni stilovi i animacije
- **Vanilla JavaScript**: Čista logika bez framework-ova
- **Local Storage**: Perzistentno čuvanje podataka
- **Web Audio API**: Zvučni efekti
- **CSS Grid/Flexbox**: Responsive layout

## 📁 Struktura Projekta

```
Blagoje Minesweeper/
├── index.html          # Glavna HTML struktura
├── styles/
│   └── style.css      # Svi stilovi i animacije
├── scripts/
│   ├── main.js        # Entry point
│   ├── game.js        # Glavna logika igre
│   ├── board.js       # Logika table
│   └── ui.js          # UI interakcije
├── README.md          # Ova dokumentacija
└── predlozi.md        # Lista predloženih modifikacija
```

## 🎯 Planirane Funkcionalnosti

Pogledajte `predlozi.md` za detaljnu listu predloženih modifikacija i poboljšanja.

## 🤝 Doprinosi

Dobrodošli su svi predlozi za poboljšanja! Molimo vas da:
1. Opisete problem ili predlog
2. Priložite screenshot ako je potrebno
3. Testirate vaše izmene

## 📄 Licenca

Ovaj projekat je otvorenog koda i slobodan je za korišćenje i modifikaciju.

---

**Uživajte u igri! 🎮✨**

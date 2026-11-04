# ATG V75: kampanjsida (t-shirt)

Statisk mobilsida för ATG:s V75-guerilla. Den som plockat en vinnare väljer färg, storlek och adress och får en t-shirt hemskickad. De 100 första vinner (räknas i en Supabase-databas), sedan visas `slut.html` automatiskt. Design från Claude Design (senast `atg-v75-kampanjsida-nyny.zip`, 26-11-03), byggd av Shiny Happy People.

Ingen byggprocess och inga beroenden. Lägg mappen på valfri webbserver.

## Databasen (Supabase)

- Projekt `atg-v75` (ref `nkfxqteujqatmzwbnxrn`, Stockholm) i organisationen Shiny Happy People. SQL:en som bygger den ligger hos SHP (`atg-databas-26-11-04.sql` i projektmappen) och kan köras om.
- Sidan anropar bara två funktioner med den publika nyckeln i `script.js`:
  - `tshirt_status()` när sidan laddas. Är det slut skickas besökaren till `slut.html`. Innehållet är dolt tills svaret kommit, högst 3 sekunder.
  - `anmal_tshirt(...)` vid Skicka. Svarar `ok`, `slut`, `dubblett` eller `ogiltig`.
- Databasen släpper in exakt `max_antal` inskick (tabellen `kampanj`), även när många skickar samtidigt. En t-shirt per e-postadress.
- Den publika nyckeln kan inte läsa listan eller ändra gränsen. Listan läses i Supabase-panelen: Table Editor, `anmalningar`, Export to CSV.
- Antalet räknas ur raderna. Raderas ett fejkat inskick öppnas platsen igen.
- **Ändra gränsen:** `update public.kampanj set max_antal = 100;` i SQL Editor.
- **Efter kampanjen:** sätt `max_antal` till 0 först, töm sedan listan (`truncate table public.anmalningar;`). I omvänd ordning öppnas sidan igen.
- **Håll vaken:** `.github/workflows/ping-databas.yml` frågar databasen varje dag så att gratisplanen inte pausar projektet. Misslyckas den mejlar GitHub. Stäng av den under Actions efter kampanjen.

## Mejlet till Lasse (FormSubmit)

- Varje godkänt inskick blir också ett mejl via [FormSubmit](https://formsubmit.co), rubrik **ATG - T-shirt**, tabellmall, med raden "Nummer 38 av 100" överst. Mejlet är en avisering: går det inte fram är inskicket ändå sparat.
- Svara på mejlet så går svaret till deltagarens e-post (`_replyto`).
- Spamfälla (`_honey`) i ett dolt fält: ifylld fälla sparar inget.
- Postnummer kräver fem siffror (`123 45` eller `12345`), sparas och mejlas alltid som `123 45`.
- **Aktivering:** första inskicket från en ny adress skickar ett aktiveringsmejl från FormSubmit till mottagaren. Inga mejl levereras förrän någon klickat på knappen i det mejlet.
- **Dölj adressen:** efter aktivering skickar FormSubmit en slumpsträng (alias). Byt `TO` i `script.js` mot den så syns mejladressen inte i källkoden.
- **Flytt till ny domän:** testa ett inskick direkt efter flytten. Kräver FormSubmit ny aktivering kommer mejlet igen.

## Filer

| Fil | Innehåll |
|---|---|
| `index.html` | Hero, intro, två foton (klick ger helskärm), färgval, storleksval, adressformulär, lagertext, villkor med integritetsrad, Skicka |
| `slut.html` | Visas när de 100 t-shirtarna är slut: samma hero, bara text |
| `styles.css` | All styling. Färger, marginal och typsnitt som CSS-variabler i `:root` |
| `script.js` | Koll om det är slut, validering, inskick till databasen, mejl via FormSubmit, lightbox |
| `.github/workflows/ping-databas.yml` | Daglig ping som håller databasen vaken |
| `fonts/` | ATG Rubrik + ATG Text som woff2 (konverterade från kundens otf) |
| `img/hero.jpg`, `img/hero@2x.jpg` | Jockeyn, 1000 och 2000 px. 2x ur originalet `woman screen right_FULL.png` |
| `img/tshirt-peach.jpg`, `img/tshirt-offwhite.jpg` | Modellbilder, 746 px (originalen är inte större) |
| `img/atg-logo.png` | ATG-loggan, 216 px (4x visningsstorlek) |
| `img/og.jpg` | Delningsbild 1200×630 för länkförhandsvisning |
| `img/favicon.png`, `img/apple-touch-icon.png` | Ikoner |

## Designbeslut från mockupen

- Bredd 390 px som referens, max 560 px, centrerad. Sidomarginal 32 px (`--gutter`).
- Alla mått står i designpixlar (`--u`) och skalar med kolumnen: 1 px vid 390 px bredd, 1,44 px vid 560. Sidan ser då ut som skissen på varje bredd. Under 390 px står måtten still och texten bryts fritt.
- Bredare skärmar: hero-bilden ligger fast i helskärm bakom kolumnen, mörkad med `--backdrop-dim` (62 % svart), och kolumnen har en mjuk skugga. Claude Designs version (430 px kolumn, suddig bakgrund) är medvetet inte införd.
- Bakgrund `#FCF3E8`, text `#1A1A1A`, fält vita.
- Hero 230 px hög, bilden skalad 136 % och ankrad i nederkant. Rubrik ATG Rubrik 25 px, versaler.
- Intro-rubrik ATG Text ExtraBold Italic 20 px. Brödtext 17,3 px. Lagertext 14 px fet kursiv, villkor 10 px. Hårda radbrytningar vid 390 px och bredare, under 389 px bryts texten fritt.
- Foton: två i 4:5 sida vid sida. Klick öppnar bilden i helskärm, stängs med krysset, Esc eller klick utanför.
- Färg och storlek: radioknappar stylade som 48 px höga knappar, vald = svart. Båda är obligatoriska.
- Fältet **Ort** ersätter skissens "Land", eftersom t-shirten bara skickas inom Sverige.

## Publicering

- Sidan har `noindex`. Den nås via QR eller länk, inte via sök.
- Byts adressen: uppdatera `og:url` och `og:image` i `index.html`.
- Bumpa `?v=` på `styles.css` och `script.js` i `index.html` vid ändring, GitHub Pages cachar i 10 minuter.
- Typsnitten är ATG:s licensierade filer.

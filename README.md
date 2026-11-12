# ATG V75: kampanjsida (t-shirt)

Statisk mobilsida för ATG:s V75-guerilla. Den som plockat en vinnare väljer färg, storlek och adress och får en t-shirt hemskickad. De 100 första vinner (räknas i en Supabase-databas), sedan visas `slut.html` automatiskt. Design från Claude Design (senast `atg-v75-kampanjsida-nyny.zip`, 26-11-03), byggd av Shiny Happy People.

Ingen byggprocess och inga beroenden. Lägg mappen på valfri webbserver.

## Databasen (Supabase)

- Projekt `atg-v75` (ref `nkfxqteujqatmzwbnxrn`, Stockholm) i organisationen Shiny Happy People. SQL:en som bygger den ligger hos SHP (`atg-databas-26-11-04.sql` i projektmappen) och kan köras om.
- Adress och publik nyckel står i `db.js`, som laddas överst i `<head>` och genast frågar databasen. Sidan anropar bara två funktioner:
  - `tshirt_status()` innan sidan ritas. Är det slut visar `index.html` slutsidans text direkt på samma sida och adressen byts till `slut.html`. Formuläret ritas aldrig. Innehållet under heron är dolt tills svaret kommit, högst 3 sekunder.
  - `anmal_tshirt(...)` vid Skicka. Svarar `ok`, `slut`, `dubblett` eller `ogiltig`. Vid `slut` byts sidan till sluttexten på samma sätt.
- `slut.html` frågar också: har platser öppnats igen (efter ett test eller ett raderat inskick) skickas besökaren tillbaka till formuläret.
- Databasen släpper in exakt `max_antal` inskick (tabellen `atg_v75_kampanj`), även när många skickar samtidigt. En t-shirt per e-postadress.
- Den publika nyckeln kan inte läsa listan eller ändra gränsen. Listan läses i Supabase-panelen, se nedan.
- Antalet räknas ur raderna. Raderas ett fejkat inskick öppnas platsen igen.
- **Ändra gränsen:** `update public.atg_v75_kampanj set max_antal = 100;` i SQL Editor.
- **Efter kampanjen:** sätt `max_antal` till 0 först, töm sedan listan (`truncate table public.atg_v75_anmalningar;`). I omvänd ordning öppnas sidan igen.
- **Håll vaken:** `.github/workflows/ping-databas.yml` frågar databasen varje dag så att gratisplanen inte pausar projektet. Misslyckas den mejlar GitHub. Stäng av den under Actions efter kampanjen.

## Efter Skicka

- **Allt som stoppar ett inskick visas som en popup i mitten** med en OK-knapp: färg eller storlek saknas, tomt fält, fel postnummer, fel e-postadress (samma kontroll som databasen: `namn@domän.se`), e-post som redan använts, nätverksfel. OK tar besökaren till fältet som ska rättas, som också markeras tills det ändras. Texterna står i `MSG` i `script.js`.
- **Godkänd beställning:** besökaren skickas till `tack.html` ("Tack! Din t-shirt är på väg.") med en sammanfattning av färg, storlek och adress. Sammanfattningen ligger bara i flikens `sessionStorage`, aldrig i adressfältet. Bakåtknappen leder inte tillbaka till det ifyllda formuläret.
- **Spärr per telefon:** efter en beställning minns webbläsaren det (`localStorage`, bara en flagga). Öppnas sidan igen hamnar man direkt på tacksidan. Kringgås med annan webbläsare eller privat läge, databasens spärr per e-post gäller ändå.
- **Testa igen på samma telefon:** öppna `index.html?ny` (eller sajtens adress + `?ny`). Det nollställer spärren i den webbläsaren.

## Listan över beställningar

- Inga mejl skickas (FormSubmit togs bort 26-11-05). Databasen är den enda listan.
- Se den i Supabase-panelen: Table Editor, `atg_v75_anmalningar`. Export, CSV, ger en fil för utskicket.
- Spamfälla (`_honey`) i ett dolt fält: ifylld fälla sparar inget men visar tacksidan.
- Postnummer kräver fem siffror (`123 45` eller `12345`) och sparas alltid som `123 45`.

## Filer

| Fil | Innehåll |
|---|---|
| `index.html` | Spärr för telefoner som redan beställt, hero, sluttext (dold tills det är slut), intro, två foton (klick ger helskärm), färgval, storleksval, adressformulär, lagertext, villkor med integritetsrad, Skicka |
| `slut.html` | Visas när de 100 t-shirtarna är slut: samma hero, bara text |
| `tack.html` | Visas efter en godkänd beställning: tacktext och sammanfattning |
| `styles.css` | All styling. Färger, marginal och typsnitt som CSS-variabler i `:root` |
| `db.js` | Databasens adress och publika nyckel, frågan om det är slut |
| `script.js` | Visar formulär eller sluttext, validering med popup, inskick till databasen, vidare till tacksidan, lightbox |
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

- **Adress:** https://atg.shinyhappypeople.se/ (GitHub Pages med egen domän, från 26-11-09). Filen `CNAME` i roten talar om domänen för GitHub. Den gamla adressen `shinyhappydaniel.github.io/atg-v75-kampanjsida/` skickar vidare automatiskt.
- **DNS:** CNAME-post `atg` → `shinyhappydaniel.github.io`, i Wix (shinyhappypeople.se:s DNS ligger hos Wix).
- **Kort länk:** `shinyhappypeople.se/atg` är en 301-vidarebefordran i Wix-sajten (SEO, URL-omdirigeringar) till adressen ovan. Använd den i QR och tryck.
- Sidan har `noindex`. Den nås via QR eller länk, inte via sök.
- Byts adressen: uppdatera `CNAME`, `og:url` och `og:image` i `index.html`, och vidarebefordringen i Wix.
- Bumpa `?v=` på `styles.css` och `script.js` i `index.html` vid ändring, GitHub Pages cachar i 10 minuter.
- Typsnitten är ATG:s licensierade filer.

# ATG V75: kampanjsida (t-shirt)

Statisk mobilsida för ATG:s V75-guerilla. Den som plockat en vinnare väljer färg, storlek och adress och får en t-shirt hemskickad. De 100 första vinner, sedan visas `slut.html`. Design från Claude Design (senast `atg-v75-kampanjsida-nyny.zip`, 26-11-03), byggd av Shiny Happy People.

Ingen byggprocess och inga beroenden. Lägg mappen på valfri webbserver.

## Formuläret

- Skickas via [FormSubmit](https://formsubmit.co) som mejl till Lasse, rubrik **ATG - T-shirt**, tabellmall.
- Svara på mejlet så går svaret till deltagarens e-post (`_replyto`).
- Mejlet innehåller Färg (Peach/Offwhite), Storlek (XS till XL), Namn, Adress, Postnummer, Ort och E-post.
- Spamfälla (`_honey`) i ett dolt fält.
- Postnummer kräver fem siffror (`123 45` eller `12345`), mejlet får alltid formatet `123 45`.
- **Aktivering:** första inskicket från en ny adress skickar ett aktiveringsmejl från FormSubmit till mottagaren. Inget levereras förrän någon klickat på knappen i det mejlet.
- **Dölj adressen:** efter aktivering skickar FormSubmit en slumpsträng (alias). Byt `TO` i `script.js` mot den så syns mejladressen inte i källkoden.
- **De 100 första:** FormSubmit räknar inte inskick. Lasse håller koll på antalet mejl. Vid 100: ta bort kommentaren runt `meta http-equiv="refresh"` överst i `index.html` och pusha, så skickas alla vidare till `slut.html`.
- **Flytt till ny domän:** testa ett inskick direkt efter flytten. Kräver FormSubmit ny aktivering kommer mejlet igen.

## Filer

| Fil | Innehåll |
|---|---|
| `index.html` | Hero, intro, två foton (klick ger helskärm), färgval, storleksval, adressformulär, lagertext, villkor med integritetsrad, Skicka |
| `slut.html` | Visas när de 100 t-shirtarna är slut: samma hero, bara text |
| `styles.css` | All styling. Färger, marginal och typsnitt som CSS-variabler i `:root` |
| `script.js` | Validering, inskick till FormSubmit och lightbox för fotona |
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

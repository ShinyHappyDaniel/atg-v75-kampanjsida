# ATG V75: kampanjsida (t-shirt)

Statisk mobilsida för ATG:s V75-guerilla. Den som plockat en vinnare anger storlek och adress och får en t-shirt hemskickad. Design från Claude Design (`atg-v75-kampanjsida-ny.zip`), byggd av Shiny Happy People.

Ingen byggprocess och inga beroenden. Lägg mappen på valfri webbserver.

## Formuläret

- Skickas via [FormSubmit](https://formsubmit.co) som mejl till Lasse, rubrik **ATG - T-shirt**, tabellmall.
- Svara på mejlet så går svaret till deltagarens e-post (`_replyto`).
- Spamfälla (`_honey`) i ett dolt fält.
- Postnummer kräver fem siffror (`123 45` eller `12345`), mejlet får alltid formatet `123 45`.
- **Aktivering:** första inskicket från en ny adress skickar ett aktiveringsmejl från FormSubmit till mottagaren. Inget levereras förrän någon klickat på knappen i det mejlet.
- **Dölj adressen:** efter aktivering skickar FormSubmit en slumpsträng (alias). Byt `TO` i `script.js` mot den så syns mejladressen inte i källkoden.
- **Flytt till ny domän:** testa ett inskick direkt efter flytten. Kräver FormSubmit ny aktivering kommer mejlet igen.

## Filer

| Fil | Innehåll |
|---|---|
| `index.html` | Hero, intro, storleksval, adressformulär, villkor, integritetsrad, Skicka |
| `styles.css` | All styling. Färger, marginal och typsnitt som CSS-variabler i `:root` |
| `script.js` | Validering och inskick till FormSubmit |
| `fonts/` | ATG Rubrik + ATG Text som woff2 (konverterade från kundens otf) |
| `img/hero.jpg`, `img/hero@2x.jpg` | Jockeyn, 1000 och 2000 px. 2x ur originalet `woman screen right_FULL.png` |
| `img/tshirt.png` | Frilagd t-shirt |
| `img/atg-logo.png` | ATG-loggan, 216 px (4x visningsstorlek) |
| `img/og.jpg` | Delningsbild 1200×630 för länkförhandsvisning |
| `img/favicon.png`, `img/apple-touch-icon.png` | Ikoner |

## Designbeslut från mockupen

- Bredd 390 px som referens, max 560 px, centrerad. Sidomarginal 32 px (`--gutter`).
- Bakgrund `#FCF3E8`, text `#1A1A1A`, fält vita.
- Hero 230 px hög, bilden skalad 136 % och ankrad i nederkant. Rubrik ATG Rubrik 25 px, versaler.
- Intro-rubrik ATG Text ExtraBold Italic 20 px. Brödtext 17,3 px. Hårda radbrytningar vid 390 px och bredare, under 389 px bryts texten fritt.
- Storleksval: radioknappar stylade som rutor, bara en storlek kan väljas.
- Fältet **Ort** ersätter skissens "Land", eftersom t-shirten bara skickas inom Sverige.

## Publicering

- Sidan har `noindex`. Den nås via QR eller länk, inte via sök.
- Byts adressen: uppdatera `og:url` och `og:image` i `index.html`.
- Bumpa `?v=` på `styles.css` och `script.js` i `index.html` vid ändring, GitHub Pages cachar i 10 minuter.
- Typsnitten är ATG:s licensierade filer.

// Databasen (Supabase). Laddas överst i <head> på index.html och slut.html.
// Den publika nyckeln når bara tshirt_status() och anmal_tshirt(), aldrig listan (se atg-databas-26-11-04.sql).
// Adressen och nyckeln läses också av den dagliga pingen (.github/workflows/ping-databas.yml).
var DB_URL = 'https://nkfxqteujqatmzwbnxrn.supabase.co';
var DB_KEY = 'sb_publishable_BWeioTLKbRV83mLM8oy9-w_uUhJr5zX';

function dbRpc(fn, args) {
  return fetch(DB_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { 'apikey': DB_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(args || {})
  }).then(function (res) {
    if (!res.ok) throw new Error('Databasen svarade ' + res.status);
    return res.json();
  });
}

// Frågan om t-shirtarna är slut startar direkt, innan sidan ritas.
// Ger {slut, kvar}, eller null om databasen inte svarar (då visas formuläret som vanligt).
var DB_STATUS = dbRpc('tshirt_status').catch(function (err) {
  console.error('Kunde inte kolla antalet:', err);
  return null;
});

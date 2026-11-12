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

// Besöksräknare utan cookies. Sparar bara tidpunkt, källa (utm_source eller värdnamnet
// besökaren kom från) och mobil/dator. Ingen IP-adress, inga id:n, inget sparas i webbläsaren.
(function () {
  if (navigator.webdriver) return; // automatiska webbläsare räknas inte
  var kalla = 'direkt';
  try {
    var utm = new URLSearchParams(location.search).get('utm_source');
    if (utm) kalla = utm;
    else if (document.referrer) {
      var host = new URL(document.referrer).hostname;
      if (host && host !== location.hostname) kalla = host;
    }
  } catch (e) {}
  var enhet = window.matchMedia('(max-width: 720px)').matches ? 'mobil' : 'dator';
  dbRpc('atg_v75_besok_logga', { p_kalla: kalla, p_enhet: enhet }).catch(function () {});
})();

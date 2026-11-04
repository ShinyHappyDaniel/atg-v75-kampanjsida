// Inskicken sparas i en Supabase-databas som räknar dem och släpper in de 100 första.
// Databasadress, nyckel och frågan "är det slut?" ligger i db.js, som laddas i <head>.
// Varje godkänt inskick blir också ett mejl till Lasse via FormSubmit (rubrik "ATG - T-shirt").
// När de 100 är slut visas slutsidans text direkt på samma sida och adressen blir slut.html,
// både vid sidladdning och vid inskick. Formuläret syns aldrig när det är slut.
// Längst ner: helskärmsvisning (lightbox) av t-shirtbilderna.
//
// Mejlmottagaren byggs ihop här så adressen inte ligger i klartext för spambottar.
// När FormSubmit-formuläret är aktiverat: byt TO mot slumpsträngen (alias) som
// FormSubmit skickar i aktiveringsmejlet, så syns adressen inte alls i källkoden.
(function () {
  'use strict';

  var TO = ['lasse', 'shinyhappypeople.se'].join('@');
  var MAIL_ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  var SUBJECT = 'ATG - T-shirt';

  var SLUT_URL = 'slut.html';
  var SLUT_TITLE = 'Alla t-shirts är slut | ATG';
  var STATUS_TIMEOUT = 3000;   // ms: svarar inte databasen visas formuläret ändå

  var MSG_OK = 'Tack! Din t-shirt är på väg.';
  var MSG_DUP = 'Den här e-postadressen har redan en t-shirt på väg. Endast en t-shirt per tävlande.';
  var MSG_INVALID = 'Något i formuläret stämmer inte. Kontrollera uppgifterna och försök igen.';
  var MSG_FAIL = 'Något gick fel. Försök igen om en stund.';

  var root = document.documentElement;
  var startView = document.getElementById('start-innehall');
  var soldOutView = document.getElementById('slut-innehall');

  initLightbox();

  function reveal() {
    root.classList.remove('kollar');
  }

  // Slut: byt till slutsidans text på plats. Ingen ny sidladdning, formuläret döljs helt.
  function showSoldOut() {
    var box = document.getElementById('lightbox');
    if (box && !box.hidden) document.getElementById('lightbox-close').click();
    startView.hidden = true;
    soldOutView.hidden = false;
    document.title = SLUT_TITLE;
    if (window.history && history.replaceState) history.replaceState(null, '', SLUT_URL);
    reveal();
    window.scrollTo(0, 0);
  }

  // ---- Är t-shirtarna slut? Frågan startade redan i db.js. Innehållet är dolt (klassen "kollar") tills svaret kommit. ----
  var timer = setTimeout(reveal, STATUS_TIMEOUT);
  DB_STATUS.then(function (s) {
    clearTimeout(timer);
    if (s && s.slut === true) showSoldOut();
    else reveal();
  });

  // ---- Formulär ----
  var form = document.getElementById('tshirt-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var button = form.querySelector('.submit');
  var label = button.textContent;

  function show(msg) {
    status.textContent = msg;
    status.hidden = false;
  }

  function value(name) {
    return form.elements[name].value.trim();
  }

  // 12345 och 123 45 godtas, allt sparas och mejlas som 123 45.
  function postnummer(raw) {
    var d = raw.replace(/\D/g, '');
    return d.length === 5 ? d.slice(0, 3) + ' ' + d.slice(3) : raw;
  }

  // Texten på den valda knappen, t.ex. "Peach" eller "XS".
  function choice(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.parentNode.textContent.trim() : '';
  }

  function lockForm() {
    Array.prototype.forEach.call(form.elements, function (el) { el.disabled = true; });
  }

  function unlock(msg) {
    button.disabled = false;
    button.textContent = label;
    show(msg);
  }

  // Mejlet till Lasse är en avisering. Inskicket är redan sparat, så ett fel här stoppar inget.
  function sendMail(d, svar) {
    var payload = {
      _subject: SUBJECT,
      _template: 'table',
      _captcha: 'false',
      _replyto: d.epost,
      'Nummer': svar.nummer + ' av ' + svar.max,
      'Färg': d.farg,
      'Storlek': d.storlek,
      'Namn': d.namn,
      'Adress': d.adress,
      'Postnummer': d.postnummer,
      'Ort': d.ort,
      'E-post': d.epost
    };
    fetch(MAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || String(data.success) !== 'true') {
          throw new Error((data && data.message) || 'Okänt svar från FormSubmit');
        }
      })
      .catch(function (err) { console.error('Mejlet till Lasse kunde inte skickas:', err); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Spamfällan är ifylld: låtsas att allt gick bra och spara inget.
    if (value('_honey')) {
      lockForm();
      show(MSG_OK);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var d = {
      farg: choice('farg'),
      storlek: choice('storlek'),
      namn: value('namn'),
      adress: value('adress'),
      postnummer: postnummer(value('postnummer')),
      ort: value('ort'),
      epost: value('epost')
    };

    button.disabled = true;
    button.textContent = 'Skickar …';
    status.hidden = true;

    dbRpc('anmal_tshirt', {
      p_farg: d.farg, p_storlek: d.storlek, p_namn: d.namn, p_adress: d.adress,
      p_postnummer: d.postnummer, p_ort: d.ort, p_epost: d.epost
    })
      .then(function (svar) {
        var s = svar && svar.status;
        if (s === 'ok') {
          lockForm();
          button.textContent = 'Skickat';
          show(MSG_OK);
          sendMail(d, svar);
        } else if (s === 'slut') {
          showSoldOut();
        } else if (s === 'dubblett') {
          unlock(MSG_DUP);
        } else if (s === 'ogiltig') {
          unlock(MSG_INVALID);
        } else {
          throw new Error('Okänt svar från databasen');
        }
      })
      .catch(function (err) {
        console.error('Formuläret kunde inte skickas:', err);
        unlock(MSG_FAIL);
      });
  });

  // ---- Lightbox: klick på en bild visar den i helskärm. Stängs med krysset, Esc eller klick utanför. ----
  function initLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;
    var img = document.getElementById('lightbox-img');
    var close = document.getElementById('lightbox-close');
    var backdrop = document.getElementById('lightbox-backdrop');
    var page = document.getElementById('page');
    var trigger = null;

    function open(src, alt, btn) {
      img.src = src;
      img.alt = alt || '';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      if (page) page.inert = true;   // tabb stannar i lightboxen
      trigger = btn;
      close.focus();
    }

    function shut() {
      box.hidden = true;
      img.removeAttribute('src');
      document.body.style.overflow = '';
      if (page) page.inert = false;
      if (trigger) trigger.focus();
    }

    Array.prototype.forEach.call(document.querySelectorAll('.photo[data-lightbox]'), function (btn) {
      btn.addEventListener('click', function () {
        open(btn.getAttribute('data-lightbox'), btn.getAttribute('data-alt'), btn);
      });
    });
    close.addEventListener('click', shut);
    backdrop.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) shut();
    });
  }
})();

// Inskicken sparas i en Supabase-databas som räknar dem och släpper in de 100 första.
// Databasadress, nyckel och frågan "är det slut?" ligger i db.js, som laddas i <head>.
// Inga mejl skickas. Listan över beställningar finns i databasen (tabellen anmalningar).
//
// Efter en godkänd beställning skickas man till tack.html (med en sammanfattning), och
// telefonen minns det: öppnas sidan igen hamnar man direkt på tacksidan (se <head> i index.html).
// När de 100 är slut visas slutsidans text direkt på samma sida och adressen blir slut.html.
// Allt som stoppar ett inskick visas som en popup i mitten av skärmen.
// Längst ner: helskärmsvisning (lightbox) av t-shirtbilderna.
(function () {
  'use strict';

  var SLUT_URL = 'slut.html';
  var SLUT_TITLE = 'Alla t-shirts är slut | ATG';
  var TACK_URL = 'tack.html';
  var STATUS_TIMEOUT = 3000;   // ms: svarar inte databasen visas formuläret ändå

  // Nycklar i webbläsarens lagring. Beställd = bara en flagga, inga personuppgifter.
  var KEY_ORDERED = 'atg-v75-bestallt';    // localStorage: telefonen har beställt
  var KEY_RECEIPT = 'atg-v75-kvitto';      // sessionStorage: sammanfattningen till tacksidan

  // Meddelanden i popupen: [rubrik, text]
  var MSG = {
    farg: ['Välj färg', 'Välj om du vill ha t-shirten i Peach eller Offwhite.'],
    storlek: ['Välj storlek', 'Välj en storlek mellan XS och XL.'],
    namn: ['Fyll i ditt namn', 'Skriv ditt för- och efternamn, så vet vi vem t-shirten ska till.'],
    adress: ['Fyll i adressen', 'Skriv gatuadressen dit t-shirten ska skickas.'],
    postnummer: ['Fyll i postnumret', 'Postnumret är fem siffror, till exempel 123 45.'],
    postnummerFel: ['Kolla postnumret', 'Postnumret ska vara fem siffror, till exempel 123 45.'],
    ort: ['Fyll i orten', 'Skriv vilken ort adressen ligger i.'],
    epost: ['Fyll i e-postadressen', 'Skriv din e-postadress, till exempel namn@exempel.se.'],
    epostFel: ['Kolla e-postadressen', 'Adressen ser inte ut att stämma. Den ska se ut ungefär som namn@exempel.se.'],
    dubblett: ['Den här e-postadressen är redan med', 'Den har redan en t-shirt på väg. Endast en t-shirt per tävlande.'],
    ogiltig: ['Något stämmer inte', 'Kontrollera uppgifterna i formuläret och försök igen.'],
    fel: ['Något gick fel', 'Det gick inte att skicka just nu. Försök igen om en stund.']
  };
  // Samma kontroll som databasen gör: något@något.något
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var PNR_RE = /^[0-9]{3} ?[0-9]{2}$/;

  var root = document.documentElement;
  var startView = document.getElementById('start-innehall');
  var soldOutView = document.getElementById('slut-innehall');

  initLightbox();
  var notice = initNotice();

  function reveal() {
    root.classList.remove('kollar');
  }

  // Slut: byt till slutsidans text på plats. Ingen ny sidladdning, formuläret döljs helt.
  function showSoldOut() {
    var box = document.getElementById('lightbox');
    if (box && !box.hidden) document.getElementById('lightbox-close').click();
    notice.close();
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
  var button = form.querySelector('.submit');
  var label = button.textContent;

  function value(name) {
    return form.elements[name].value.trim();
  }

  // 12345 och 123 45 godtas, allt sparas som 123 45.
  function postnummer(raw) {
    var d = raw.replace(/\D/g, '');
    return d.length === 5 ? d.slice(0, 3) + ' ' + d.slice(3) : raw;
  }

  // Texten på den valda knappen, t.ex. "Peach" eller "XS".
  function choice(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.parentNode.textContent.trim() : '';
  }

  // Första felet uppifrån: [fältnamn, meddelande], eller null om allt är ifyllt rätt.
  function firstError() {
    if (!choice('farg')) return ['farg', MSG.farg];
    if (!choice('storlek')) return ['storlek', MSG.storlek];
    if (!value('namn')) return ['namn', MSG.namn];
    if (!value('adress')) return ['adress', MSG.adress];
    if (!value('postnummer')) return ['postnummer', MSG.postnummer];
    if (!PNR_RE.test(value('postnummer'))) return ['postnummer', MSG.postnummerFel];
    if (!value('ort')) return ['ort', MSG.ort];
    if (!value('epost')) return ['epost', MSG.epost];
    if (!EMAIL_RE.test(value('epost'))) return ['epost', MSG.epostFel];
    return null;
  }

  // Markera fältet eller valet som ska rättas. Markeringen försvinner när man ändrar det.
  function markField(name) {
    var el = form.elements[name];
    var first = el.length ? el[0] : el;
    var box = first.closest('.field, .choice');
    if (box) box.classList.add('fel');
    return first;
  }
  form.addEventListener('input', clearMark);
  form.addEventListener('change', clearMark);
  function clearMark(e) {
    var box = e.target.closest && e.target.closest('.field, .choice');
    if (box) box.classList.remove('fel');
  }

  // Visa popupen. Efter OK hamnar man i fältet som ska rättas.
  function stop(name, msg) {
    var target = name ? markField(name) : null;
    notice.open(msg[0], msg[1], target);
  }

  function lockForm() {
    Array.prototype.forEach.call(form.elements, function (el) { el.disabled = true; });
  }

  function unlock() {
    button.disabled = false;
    button.textContent = label;
  }

  function store(storage, key, val) {
    try { window[storage].setItem(key, val); } catch (e) { /* privat läge: tacksidan visas ändå */ }
  }

  function goToThanks() {
    window.location.replace(TACK_URL);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Spamfällan är ifylld: låtsas att allt gick bra och spara inget.
    if (value('_honey')) {
      lockForm();
      goToThanks();
      return;
    }

    var err = firstError();
    if (err) {
      stop(err[0], err[1]);
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

    dbRpc('anmal_tshirt', {
      p_farg: d.farg, p_storlek: d.storlek, p_namn: d.namn, p_adress: d.adress,
      p_postnummer: d.postnummer, p_ort: d.ort, p_epost: d.epost
    })
      .then(function (svar) {
        var s = svar && svar.status;
        if (s === 'ok') {
          lockForm();
          store('localStorage', KEY_ORDERED, String(Date.now()));
          store('sessionStorage', KEY_RECEIPT, JSON.stringify({
            farg: d.farg, storlek: d.storlek, namn: d.namn,
            adress: d.adress, postnummer: d.postnummer, ort: d.ort
          }));
          return goToThanks();
        }
        if (s === 'slut') return showSoldOut();
        unlock();
        if (s === 'dubblett') return stop('epost', MSG.dubblett);
        if (s === 'ogiltig') return stop(null, MSG.ogiltig);
        throw new Error('Okänt svar från databasen');
      })
      .catch(function (err) {
        console.error('Formuläret kunde inte skickas:', err);
        unlock();
        stop(null, MSG.fel);
      });
  });

  // ---- Popup i mitten (dialog). Stängs med OK, Esc eller klick utanför. ----
  function initNotice() {
    var dlg = document.getElementById('notice');
    var title = document.getElementById('notice-title');
    var text = document.getElementById('notice-text');
    var ok = document.getElementById('notice-ok');
    var target = null;

    function focusTarget() {
      if (!target) return;
      var box = target.closest('.field, .choice') || target;
      box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.focus({ preventScroll: true });
      target = null;
    }

    dlg.addEventListener('close', focusTarget);
    ok.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dlg.close();
    });

    return {
      open: function (t, msg, field) {
        title.textContent = t;
        text.textContent = msg;
        target = field || null;
        if (dlg.open) dlg.close();
        dlg.showModal();
        ok.focus();
      },
      close: function () {
        target = null;
        if (dlg.open) dlg.close();
      }
    };
  }

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

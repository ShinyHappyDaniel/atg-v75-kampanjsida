// Formuläret skickas som mejl via FormSubmit (formsubmit.co), ingen egen backend behövs.
// Längst ner: helskärmsvisning (lightbox) av t-shirtbilderna.
// Varje inskick blir ett mejl med rubriken "ATG - T-shirt".
//
// Mottagaren byggs ihop här så adressen inte ligger i klartext för spambottar.
// När FormSubmit-formuläret är aktiverat: byt TO mot slumpsträngen (alias) som
// FormSubmit skickar i aktiveringsmejlet, så syns adressen inte alls i källkoden.
(function () {
  'use strict';

  var TO = ['lasse', 'shinyhappypeople.se'].join('@');
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  var SUBJECT = 'ATG - T-shirt';

  var MSG_OK = 'Tack! Din t-shirt är på väg.';
  var MSG_FAIL = 'Något gick fel. Försök igen om en stund.';

  initLightbox();

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

  // 12345 och 123 45 godtas, mejlet får alltid formatet 123 45.
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Spamfällan är ifylld: låtsas att allt gick bra och skicka inget.
    if (value('_honey')) {
      lockForm();
      show(MSG_OK);
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var payload = {
      _subject: SUBJECT,
      _template: 'table',
      _captcha: 'false',
      _replyto: value('epost'),
      'Färg': choice('farg'),
      'Storlek': choice('storlek'),
      'Namn': value('namn'),
      'Adress': value('adress'),
      'Postnummer': postnummer(value('postnummer')),
      'Ort': value('ort'),
      'E-post': value('epost')
    };

    button.disabled = true;
    button.textContent = 'Skickar …';
    status.hidden = true;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || String(data.success) !== 'true') {
          throw new Error((data && data.message) || 'Okänt svar från FormSubmit');
        }
        lockForm();
        button.textContent = 'Skickat';
        show(MSG_OK);
      })
      .catch(function (err) {
        console.error('Formuläret kunde inte skickas:', err);
        button.disabled = false;
        button.textContent = label;
        show(MSG_FAIL);
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

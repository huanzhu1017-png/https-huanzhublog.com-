// Keeps the music playing while visitors move between pages.
// Internal links are loaded in place (fetch + swap the .page content) instead of a full reload,
// so the ♪ player at the bottom of the page is never torn down.
(function () {
  if (!window.fetch || !window.history || !history.pushState || !window.DOMParser) return;
  var loaded = {};
  document.querySelectorAll('script[src]').forEach(function (s) { loaded[s.src] = true; });

  function eligible(a, e) {
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.origin !== location.origin) return false;
    var p = a.pathname;
    if (/\/tools\//.test(p)) return false;                              // dashboard has its own styles: normal navigation
    if (!/(\/|\.html)$/.test(p)) return false;                           // only pages, not files
    if (p === location.pathname && a.hash && a.search === location.search) return false; // same-page anchor
    return true;
  }

  function runScripts(doc) {
    var list = Array.prototype.slice.call(doc.querySelectorAll('body script'));
    var chain = Promise.resolve();
    list.forEach(function (s) {
      chain = chain.then(function () {
        if (s.src) {
          var abs = new URL(s.getAttribute('src'), location.href).href;
          if (/\/(music|router)\.js/.test(abs) || loaded[abs]) return;
          return new Promise(function (res) {
            var n = document.createElement('script'); n.src = abs; n.onload = n.onerror = res;
            loaded[abs] = true; document.body.appendChild(n);
          });
        }
        try { (new Function(s.textContent))(); } catch (err) { console.error(err); }
      });
    });
    return chain;
  }

  function swap(url, push) {
    return fetch(url, { headers: { Accept: 'text/html' } }).then(function (r) {
      if (!r.ok && r.status !== 404) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var next = doc.querySelector('.page'), cur = document.querySelector('.page');
      if (!next || !cur) { location.href = url; return; }
      if (push) history.pushState({ hz: 1 }, '', url);
      document.title = doc.title;
      var d = doc.querySelector('meta[name="description"]'), md = document.querySelector('meta[name="description"]');
      if (d && md) md.setAttribute('content', d.getAttribute('content'));
      cur.replaceWith(document.adoptNode(next));
      var hash = new URL(url, location.href).hash;
      var target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
      var h = document.querySelector('.page h1');
      if (h && !target) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      return runScripts(doc);
    }).catch(function () { location.href = url; });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!eligible(a, e)) return;
    e.preventDefault();
    swap(a.href, true);
  });
  window.addEventListener('popstate', function () { swap(location.href, false); });
  history.replaceState({ hz: 1 }, '', location.href);
})();

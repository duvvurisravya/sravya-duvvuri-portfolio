/* Sravya Duvvuri portfolio — interaction layer.
   Everything here is progressive: the pages are complete without it. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  root.classList.add("js");

  /* ---------- 1. Scroll reveal (content is visible at rest; animation only plays when it enters) ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var groups = [".sec-head", ".work .card", ".more-grid .mini", ".cs .head", ".cs .content > *", ".tile", ".feature", ".entry",
      ".process li", ".tools > div", ".contact", ".disciplines > div", ".brand-tile", ".slot", ".bar-row", ".li-card", ".stats > div"];
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || seen.has(en.target)) return;
        seen.add(en.target);
        var el = en.target;
        // only animate things that start below the first screen
        if (el.getBoundingClientRect().top > window.innerHeight * 0.6) el.classList.add("reveal");
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el, i) {
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : i;
        el.style.setProperty("--d", (Math.min(sib, 6) * 60) + "ms");
        io.observe(el);
      });
    });
  }

  /* ---------- 2. Count-up numbers ---------- */
  function countUp(el) {
    var txt = el.textContent.trim();
    var m = txt.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m) return;
    var pre = m[1], raw = m[2], post = m[3];
    var dec = (raw.split(".")[1] || "").length, target = parseFloat(raw.replace(/,/g, ""));
    if (!isFinite(target) || target === 0) return;
    var comma = raw.indexOf(",") > -1 || target >= 1000, t0 = null, dur = 1100;
    function fmt(v) {
      var s = v.toFixed(dec);
      if (comma) { var p = s.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); s = p.join("."); }
      return pre + s + post;
    }
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(target * e);
      if (k < 1) requestAnimationFrame(step); else el.textContent = txt;
    }
    requestAnimationFrame(step);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    $$(".stat b, .stats:not(.todo) b, .li-stats strong").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) cio.observe(el);
    });
  }

  /* ---------- 3. Work filters (homepage) ---------- */
  var bar = $(".filters"), grid = $(".work");
  if (bar && grid) {
    var cards = $$(".work .card, .more-grid .mini"), live = $(".filter-count"), more = $(".more-block");
    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-f]");
      if (!btn) return;
      var f = btn.getAttribute("data-f");
      $$("button", bar).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var shown = 0;
      cards.forEach(function (c) {
        var tags = (c.getAttribute("data-tags") || "").split(" ");
        var on = f === "all" || tags.indexOf(f) > -1;
        if (on) shown++;
        if (on && c.hidden) {
          c.hidden = false;
          if (!reduce) { c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); }
        } else if (!on && !c.hidden) {
          if (reduce) { c.hidden = true; return; }
          c.classList.add("leaving");
          setTimeout(function () { c.hidden = true; c.classList.remove("leaving"); }, 180);
        }
      });
      if (live) live.textContent = shown + (shown === 1 ? " project" : " projects");
      if (more) {
        var anyMini = $$(".more-grid .mini").some(function (m) { var t = (m.getAttribute("data-tags") || "").split(" "); return f === "all" || t.indexOf(f) > -1; });
        more.hidden = !anyMini;
      }
    });
  }

  /* ---------- 4. Project cards: tilt + "View" cursor badge ---------- */
  if (finePointer && !reduce) {
    $$(".work .card").forEach(function (card) {
      var cover = $(".cover", card);
      var badge = doc.createElement("span");
      badge.className = "view-badge"; badge.setAttribute("aria-hidden", "true");
      badge.textContent = card.classList.contains("eva") ? "Open" : "View";
      if (cover) cover.appendChild(badge);
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) translateY(-4px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" + (x * 4).toFixed(2) + "deg)";
        if (cover) {
          var cr = cover.getBoundingClientRect();
          badge.style.transform = "translate(" + (e.clientX - cr.left) + "px," + (e.clientY - cr.top) + "px) translate(-50%,-50%)";
          card.classList.toggle("over-cover", e.clientY < cr.bottom);
        }
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; card.classList.remove("over-cover"); });
    });
  }

  /* ---------- 5. Case studies: reading progress + section rail ---------- */
  var sections = $$("section.cs");
  if (sections.length) {
    var prog = doc.createElement("div");
    prog.className = "read-progress"; prog.setAttribute("aria-hidden", "true");
    doc.body.appendChild(prog);
    var onScroll = function () {
      var h = root.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    var rail = doc.createElement("nav");
    rail.className = "rail"; rail.setAttribute("aria-label", "Sections on this page");
    sections.forEach(function (s, i) {
      var lab = $(".head .label", s);
      if (!lab) return;
      if (!s.id) s.id = "s-" + lab.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var a = doc.createElement("a");
      a.href = "#" + s.id; a.innerHTML = "<span>" + lab.textContent.trim() + "</span>";
      rail.appendChild(a);
    });
    doc.body.appendChild(rail);
    if ("IntersectionObserver" in window) {
      var links = $$("a", rail);
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle("on", l.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { sio.observe(s); });
    }
  }

  /* ---------- 6. Lightbox for project screens ---------- */
  var shots = $$(".cs .frame img, .cs-hero .frame img");
  if (shots.length) {
    var box = doc.createElement("div");
    box.className = "lightbox"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Image viewer");
    box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">×</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous image">←</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Next image">→</button>';
    doc.body.appendChild(box);
    var img = $("img", box), cap = $("figcaption", box), idx = 0, last = null, list = shots;
    var show = function (i) {
      idx = (i + list.length) % list.length;
      img.src = list[idx].currentSrc || list[idx].src;
      img.alt = list[idx].alt || "";
      cap.textContent = (idx + 1) + " / " + list.length + (list[idx].alt ? " · " + list[idx].alt : "");
      var multi = list.length > 1;
      $(".lb-prev", box).hidden = !multi; $(".lb-next", box).hidden = !multi;
    };
    var open = function (el) {
      list = shots.filter(function (s) { return s.isConnected && s.complete && s.naturalWidth > 0; });
      var i = list.indexOf(el); if (i < 0) return;
      last = doc.activeElement; show(i); box.hidden = false; root.classList.add("lb-open"); $(".lb-close", box).focus();
    };
    var close = function () { box.hidden = true; root.classList.remove("lb-open"); if (last) last.focus(); };
    shots.forEach(function (s, i) {
      var fr = s.closest(".frame");
      fr.classList.add("zoomable"); fr.setAttribute("tabindex", "0"); fr.setAttribute("role", "button");
      fr.setAttribute("aria-label", "Enlarge " + (s.alt || "image"));
      fr.addEventListener("click", function () { open(s); });
      fr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(s); } });
    });
    $(".lb-close", box).addEventListener("click", close);
    $(".lb-prev", box).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", box).addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    doc.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- 7. Back to top ---------- */
  var top = doc.createElement("a");
  top.href = "#top"; top.className = "to-top"; top.setAttribute("aria-label", "Back to top"); top.textContent = "↑";
  doc.body.appendChild(top);
  window.addEventListener("scroll", function () { top.classList.toggle("show", window.scrollY > window.innerHeight * 1.2); }, { passive: true });
})();

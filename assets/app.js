/* Trang đọc bài: hiển thị bài mới nhất, lưu trữ, giới thiệu.
   Dữ liệu lấy từ data/posts.js và data/site.js. */
(function () {
  "use strict";

  var R = window.Render;
  var SITE = window.SITE || {};
  var esc = R.esc;
  var app = document.getElementById("app");

  var POSTS = (window.POSTS || []).slice().sort(function (a, b) {
    return String(b.start || "").localeCompare(String(a.start || ""));
  });

  R.applyTheme(SITE);

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }

  function postLink(p) { return "#/bai/" + encodeURIComponent(p.id); }
  function catLink(c) { return "#/danh-muc/" + encodeURIComponent(c); }
  function weekLabel(p) { return "Tuần " + p.week + " · " + R.weekRange(p); }

  function searchText(p) {
    var t = [p.title, p.sapo, (p.categories || []).join(" "), p.tacn, p.review];
    (p.sections || []).forEach(function (s) { t.push(s.heading, s.body); });
    return norm(t.join(" "));
  }

  function categoryCounts() {
    var counts = {};
    POSTS.forEach(function (p) {
      (p.categories || []).forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
    });
    var names = (SITE.categories || []).filter(function (c) { return counts[c]; });
    Object.keys(counts).forEach(function (c) { if (names.indexOf(c) < 0) names.push(c); });
    return { names: names, counts: counts };
  }

  function chips(active) {
    var cc = categoryCounts();
    if (!cc.names.length) return "";
    return cc.names.map(function (c) {
      return '<a class="chip' + (c === active ? " on" : "") + '" href="' + catLink(c) + '">' +
        esc(c) + " (" + cc.counts[c] + ")</a>";
    }).join("");
  }

  /* ---------- Các màn hình ---------- */

  function viewPost(p) {
    var idx = POSTS.indexOf(p);
    var newer = POSTS[idx - 1];
    var older = POSTS[idx + 1];
    var others = POSTS.filter(function (x) { return x !== p; }).slice(0, 5);

    var pn = "";
    if (older || newer) {
      pn = '<nav class="pn" aria-label="Chuyển bài">' +
        (older ? '<a href="' + postLink(older) + '"><span class="pn-dir">← Tuần trước</span><span class="pn-title">' + esc(older.title) + "</span></a>" : "") +
        (newer ? '<a class="pn-next" href="' + postLink(newer) + '"><span class="pn-dir">Tuần sau →</span><span class="pn-title">' + esc(newer.title) + "</span></a>" : "") +
        "</nav>";
    }

    var side = "";
    if (others.length) {
      side += '<section><h3 class="side-h">Các tuần gần đây</h3><div class="side-list">' +
        others.map(function (x) {
          return '<a href="' + postLink(x) + '"><div class="s-date">' + esc(weekLabel(x)) +
            '</div><div class="s-title">' + esc(x.title) + "</div></a>";
        }).join("") + "</div></section>";
    }
    var chipHtml = chips("");
    if (chipHtml) side += '<section><h3 class="side-h">Danh mục</h3><div class="chips">' + chipHtml + "</div></section>";
    side += '<section class="note"><h3 class="note-h">Đối chiếu và bài học</h3>' +
      (p.review && p.review.trim()
        ? '<div class="prose">' + R.blocks(p.review) + "</div>"
        : '<p class="muted">Chưa có. Cuối tuần quay lại điền để đối chiếu nhận định với diễn biến thực tế.</p>') +
      "</section>";

    return '<div class="wrap hero">' + R.postHeader(p) + "</div>" +
      '<div class="wrap layout"><article class="article prose">' + R.postBody(p) + pn +
      '</article><aside class="side">' + side + "</aside></div>";
  }

  function viewArchive(cat) {
    var list = cat
      ? POSTS.filter(function (p) { return (p.categories || []).indexOf(cat) >= 0; })
      : POSTS;

    var years = [];
    list.forEach(function (p) { if (years.indexOf(p.year) < 0) years.push(p.year); });

    var groups = years.map(function (y) {
      var items = list.filter(function (p) { return p.year === y; }).map(function (p) {
        return '<a class="arch-item" href="' + postLink(p) + '" data-q="' + esc(searchText(p)) + '">' +
          '<span class="a-week">Tuần ' + esc(p.week) + "</span>" +
          '<span class="a-main"><span class="a-title">' + esc(p.title) + "</span>" +
          (p.sapo ? '<span class="a-sapo">' + esc(p.sapo) + "</span>" : "") +
          ((p.categories || []).length ? '<span class="a-cats">' + esc(p.categories.join(" · ")) + "</span>" : "") +
          "</span>" +
          '<span class="a-date">' + esc(R.weekRange(p)) + "</span></a>";
      }).join("");
      return '<section class="arch-group"><h2 class="arch-year">' + esc(y) + '</h2><div class="arch-list">' + items + "</div></section>";
    }).join("");

    return '<div class="wrap page">' +
      '<h1 class="page-title">Lưu trữ' + (cat ? ": " + esc(cat) : "") + "</h1>" +
      '<div class="arch-tools"><div class="field"><label for="q">Tìm trong các bài đã viết</label>' +
      '<input id="q" class="input" type="search" placeholder="Ví dụ: vàng, ngô, VN-Index" autocomplete="off"></div>' +
      '<div class="chips"><a class="chip' + (cat ? "" : " on") + '" href="#/luu-tru">Tất cả</a>' + chips(cat) + "</div></div>" +
      groups +
      '<p id="arch-empty" class="muted" hidden>Không có bài nào khớp.</p>' +
      "</div>";
  }

  function viewAbout() {
    return '<div class="wrap page"><h1 class="page-title">Giới thiệu</h1><div class="prose narrow">' +
      R.blocks(SITE.about || "") +
      (SITE.author ? "<p><strong>" + esc(SITE.author) + "</strong></p>" : "") + "</div></div>";
  }

  function viewEmpty() {
    return '<div class="wrap page"><h1 class="page-title">Chưa có bài viết</h1>' +
      '<p class="muted">Mở <a href="soan-bai.html">trang Soạn bài</a> để viết bài đầu tiên.</p></div>';
  }

  function view404() {
    return '<div class="wrap page"><h1 class="page-title">Không tìm thấy bài này</h1>' +
      '<p class="muted"><a href="#/">Về bài mới nhất</a> hoặc xem <a href="#/luu-tru">lưu trữ</a>.</p></div>';
  }

  /* ---------- Điều hướng ---------- */

  function setNav(key) {
    var links = document.querySelectorAll("[data-nav]");
    for (var i = 0; i < links.length; i++) {
      var on = links[i].getAttribute("data-nav") === key;
      links[i].className = on ? "on" : "";
      if (on) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
  }

  function bindSearch() {
    var q = document.getElementById("q");
    if (!q) return;
    var groups = app.querySelectorAll(".arch-group");
    var empty = document.getElementById("arch-empty");
    q.addEventListener("input", function () {
      var t = norm(q.value.trim());
      var shown = 0;
      Array.prototype.forEach.call(groups, function (g) {
        var any = false;
        Array.prototype.forEach.call(g.querySelectorAll(".arch-item"), function (it) {
          var ok = !t || it.getAttribute("data-q").indexOf(t) >= 0;
          it.hidden = !ok;
          if (ok) { any = true; shown += 1; }
        });
        g.hidden = !any;
      });
      empty.hidden = shown > 0;
    });
  }

  function route() {
    var raw = location.hash.replace(/^#\/?/, "");
    var parts = raw.split("/").map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    var page = parts[0] || "";
    var siteName = SITE.name || "Sổ tay thị trường";
    var html, title = siteName, nav = "home", p;

    if (page === "" ) {
      if (!POSTS.length) { html = viewEmpty(); }
      else { p = POSTS[0]; html = viewPost(p); title = p.title + " · " + siteName; }
    } else if (page === "bai") {
      p = POSTS.filter(function (x) { return x.id === parts[1]; })[0];
      if (p) { html = viewPost(p); title = p.title + " · " + siteName; nav = p === POSTS[0] ? "home" : "archive"; }
      else { html = view404(); }
    } else if (page === "luu-tru") {
      html = viewArchive(""); title = "Lưu trữ · " + siteName; nav = "archive";
    } else if (page === "danh-muc") {
      html = viewArchive(parts[1] || ""); title = (parts[1] || "Lưu trữ") + " · " + siteName; nav = "archive";
    } else if (page === "gioi-thieu") {
      html = viewAbout(); title = "Giới thiệu · " + siteName; nav = "about";
    } else {
      html = view404();
    }

    app.innerHTML = html;
    document.title = title;
    setNav(nav);
    bindSearch();
    window.scrollTo(0, 0);
  }

  document.getElementById("brand").innerHTML = esc(SITE.name || "Sổ tay thị trường") + "<i>.</i>";
  document.getElementById("foot-left").textContent = (SITE.name || "Sổ tay thị trường") + " · cập nhật hàng tuần";
  document.getElementById("foot-right").textContent = SITE.footerNote || "Dành cho mục đích học tập cá nhân";

  window.addEventListener("hashchange", route);
  route();
})();

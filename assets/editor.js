/* Trang Soạn bài: điền form, xem trước, rồi lưu.
   - Nối với thư mục website (Chrome/Edge): lưu thẳng vào data/posts.js.
   - Không nối: tải file posts.js về để chép đè vào thư mục data. */
(function () {
  "use strict";

  var R = window.Render;
  var SITE = window.SITE || {};
  var esc = R.esc;
  var DRAFT_KEY = "so-tay-thi-truong.ban-nhap";

  R.applyTheme(SITE);

  function $(id) { return document.getElementById(id); }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }

  var posts = copy(window.POSTS || []);
  var current = null;
  var originalId = null;
  var snapshot = "";
  var dirHandle = null;
  var timer = null;

  /* ---------- Dữ liệu ---------- */

  function byStartDesc(a, b) {
    return String(b.start || "").localeCompare(String(a.start || ""));
  }

  function blankPost() {
    var d = new Date();
    var day = d.getDay() || 7;
    var monday = R.addDays(d, 1 - day);
    var iw = R.isoWeek(monday);
    var tpl = SITE.template || {};
    return {
      id: "", year: iw.year, week: iw.week,
      start: R.toIso(monday), published: R.toIso(d),
      title: "", sapo: "", categories: [],
      sections: (tpl.sections || []).map(function (h) { return { heading: h, body: "" }; }),
      table: (tpl.assets || []).map(function (a) { return { asset: a, close: "", change: "", view: "" }; }),
      tacn: "", review: ""
    };
  }

  function normalize(p) {
    var b = blankPost();
    p = p || {};
    return {
      id: p.id || "",
      year: p.year || b.year,
      week: p.week || b.week,
      start: p.start || b.start,
      published: p.published || b.published,
      title: p.title || "",
      sapo: p.sapo || "",
      categories: Array.isArray(p.categories) ? p.categories : [],
      sections: Array.isArray(p.sections) ? p.sections : [],
      table: Array.isArray(p.table) ? p.table : [],
      tacn: p.tacn || "",
      review: p.review || ""
    };
  }

  function isDirty() {
    return JSON.stringify(current) !== snapshot;
  }

  function buildPostsJs(list) {
    return "// File này do trang Soạn bài tạo ra. Bạn có thể sao lưu nhưng không cần sửa tay.\n" +
      "window.POSTS = " + JSON.stringify(list, null, 2) + ";\n";
  }

  function parsePostsJs(text) {
    var at = text.indexOf("window.POSTS");
    var s = text.indexOf("[", at);
    var e = text.lastIndexOf("]");
    if (at < 0 || s < 0 || e < s) return null;
    try { return JSON.parse(text.slice(s, e + 1)); } catch (err) { return null; }
  }

  /* ---------- Bản nháp tự động ---------- */

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ post: current, originalId: originalId })); } catch (e) { /* bỏ qua */ }
  }
  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* bỏ qua */ }
  }
  function loadDraft() {
    try {
      var t = localStorage.getItem(DRAFT_KEY);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  }

  /* ---------- Trạng thái, nút ---------- */

  function setStatus(msg, kind) {
    var el = $("status");
    el.textContent = msg || "";
    el.className = "ed-status" + (kind ? " " + kind : "");
  }

  function updateButtons() {
    $("btn-delete").hidden = !originalId;
    var lnk = $("lnk-view");
    lnk.hidden = !originalId;
    if (originalId) lnk.href = "index.html#/bai/" + encodeURIComponent(originalId);
  }

  function renderSelect() {
    var sel = $("sel-edit");
    sel.innerHTML = '<option value="">Sửa bài đã đăng…</option>' +
      posts.slice().sort(byStartDesc).map(function (p) {
        return '<option value="' + esc(p.id) + '">Tuần ' + esc(p.week) + "/" + esc(p.year) + " · " +
          esc(p.title || "(chưa có tiêu đề)") + "</option>";
      }).join("");
    sel.value = originalId || "";
  }

  function updateWeekNote() {
    var note = $("week-note");
    var d = R.parseDate(current.start);
    if (!d) { note.textContent = "Chọn ngày đầu tuần."; note.className = "ed-note warn"; return; }
    var text = "Tuần " + current.week + " · " + R.weekRange(current);
    if (d.getDay() !== 1) {
      note.textContent = text + ". Lưu ý: ngày này không phải thứ Hai.";
      note.className = "ed-note warn";
    } else {
      note.textContent = text;
      note.className = "ed-note";
    }
  }

  function updatePreview() {
    var html = '<div class="post">' + R.postHeader(current) + '<div class="prose">' + R.postBody(current) + "</div>";
    if (current.review && current.review.trim()) {
      html += '<section class="note" style="margin-top:32px"><h3 class="note-h">Đối chiếu và bài học</h3><div class="prose">' +
        R.blocks(current.review) + "</div></section>";
    }
    $("preview").innerHTML = html + "</div>";
  }

  function changed() {
    clearTimeout(timer);
    timer = setTimeout(function () { updatePreview(); saveDraft(); }, 200);
  }

  /* ---------- Vẽ các phần của form ---------- */

  function renderCats() {
    var all = (SITE.categories || []).slice();
    current.categories.forEach(function (c) { if (all.indexOf(c) < 0) all.push(c); });
    $("f-cats").innerHTML = all.map(function (c, i) {
      var id = "cat-" + i;
      return '<label class="ed-check" for="' + id + '"><input type="checkbox" id="' + id + '" value="' + esc(c) + '"' +
        (current.categories.indexOf(c) >= 0 ? " checked" : "") + "><span>" + esc(c) + "</span></label>";
    }).join("");
  }

  function renderSections() {
    $("f-sections").innerHTML = current.sections.map(function (s, i) {
      return '<div class="ed-card" data-i="' + i + '">' +
        '<div class="ed-card-head"><span class="ed-num" aria-hidden="true">' + (i + 1) + "</span>" +
        '<input class="input sec-h" type="text" value="' + esc(s.heading) + '" placeholder="Tiêu đề mục" aria-label="Tiêu đề mục ' + (i + 1) + '">' +
        '<div class="ed-tools">' +
        '<button type="button" class="btn btn-small" data-act="up">Lên</button>' +
        '<button type="button" class="btn btn-small" data-act="down">Xuống</button>' +
        '<button type="button" class="btn btn-small btn-danger" data-act="del">Xóa</button></div></div>' +
        '<textarea class="ed-text sec-b" rows="6" aria-label="Nội dung mục ' + (i + 1) + '">' + esc(s.body) + "</textarea></div>";
    }).join("");
  }

  function renderTable() {
    $("f-table").innerHTML = current.table.map(function (r, i) {
      var n = i + 1;
      return '<div class="ed-row" data-i="' + i + '">' +
        '<input class="input" data-k="asset" type="text" value="' + esc(r.asset) + '" placeholder="Tài sản" aria-label="Tài sản, dòng ' + n + '">' +
        '<input class="input" data-k="close" type="text" value="' + esc(r.close) + '" placeholder="Đóng cửa" aria-label="Đóng cửa, dòng ' + n + '">' +
        '<input class="input" data-k="change" type="text" value="' + esc(r.change) + '" placeholder="Biến động tuần" aria-label="Biến động tuần, dòng ' + n + '">' +
        '<input class="input" data-k="view" type="text" value="' + esc(r.view) + '" placeholder="Nhận định" aria-label="Nhận định, dòng ' + n + '">' +
        '<button type="button" class="btn btn-small btn-danger" data-act="del" aria-label="Xóa dòng ' + n + '">Xóa</button></div>';
    }).join("");
  }

  function fill() {
    $("f-start").value = current.start || "";
    $("f-week").value = current.week || "";
    $("f-year").value = current.year || "";
    $("f-published").value = current.published || "";
    $("f-title").value = current.title;
    $("f-sapo").value = current.sapo;
    $("f-tacn").value = current.tacn;
    $("f-review").value = current.review;
    renderCats();
    renderSections();
    renderTable();
    updateWeekNote();
    updateButtons();
    renderSelect();
    updatePreview();
  }

  function load(post, origId) {
    current = normalize(post);
    originalId = origId || null;
    snapshot = JSON.stringify(current);
    fill();
  }

  /* ---------- Sự kiện của form ---------- */

  [["f-title", "title"], ["f-sapo", "sapo"], ["f-tacn", "tacn"], ["f-review", "review"], ["f-published", "published"]]
    .forEach(function (pair) {
      $(pair[0]).addEventListener("input", function () { current[pair[1]] = this.value; changed(); });
    });

  $("f-start").addEventListener("input", function () {
    current.start = this.value;
    var d = R.parseDate(this.value);
    if (d) {
      var iw = R.isoWeek(d);
      current.week = iw.week;
      current.year = iw.year;
      $("f-week").value = iw.week;
      $("f-year").value = iw.year;
    }
    updateWeekNote();
    changed();
  });
  $("f-week").addEventListener("input", function () { current.week = parseInt(this.value, 10) || 0; updateWeekNote(); changed(); });
  $("f-year").addEventListener("input", function () { current.year = parseInt(this.value, 10) || 0; changed(); });

  $("f-cats").addEventListener("change", function () {
    current.categories = Array.prototype.map.call(this.querySelectorAll("input:checked"), function (i) { return i.value; });
    changed();
  });

  var secBox = $("f-sections");
  secBox.addEventListener("input", function (e) {
    var card = e.target.closest(".ed-card");
    if (!card) return;
    var i = +card.getAttribute("data-i");
    if (e.target.classList.contains("sec-h")) current.sections[i].heading = e.target.value;
    else if (e.target.classList.contains("sec-b")) current.sections[i].body = e.target.value;
    changed();
  });
  secBox.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var i = +b.closest(".ed-card").getAttribute("data-i");
    var act = b.getAttribute("data-act");
    var arr = current.sections;
    if (act === "up" && i > 0) { var t1 = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = t1; }
    else if (act === "down" && i < arr.length - 1) { var t2 = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t2; }
    else if (act === "del") {
      var has = arr[i].heading || arr[i].body;
      if (has && !confirm("Xóa mục này?")) return;
      arr.splice(i, 1);
    }
    renderSections();
    changed();
  });
  $("btn-add-section").addEventListener("click", function () {
    current.sections.push({ heading: "", body: "" });
    renderSections();
    changed();
    var last = secBox.querySelector(".ed-card:last-child .sec-h");
    if (last) last.focus();
  });

  var tblBox = $("f-table");
  tblBox.addEventListener("input", function (e) {
    var row = e.target.closest(".ed-row");
    var k = e.target.getAttribute("data-k");
    if (!row || !k) return;
    current.table[+row.getAttribute("data-i")][k] = e.target.value;
    changed();
  });
  tblBox.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act='del']");
    if (!b) return;
    current.table.splice(+b.closest(".ed-row").getAttribute("data-i"), 1);
    renderTable();
    changed();
  });
  $("btn-add-row").addEventListener("click", function () {
    current.table.push({ asset: "", close: "", change: "", view: "" });
    renderTable();
    changed();
    var last = tblBox.querySelector(".ed-row:last-child .input");
    if (last) last.focus();
  });

  /* ---------- Lưu, tải, xóa ---------- */

  function download(name, text) {
    var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  async function writeToFolder(text) {
    var dataDir = await dirHandle.getDirectoryHandle("data", { create: true });
    var fh = await dataDir.getFileHandle("posts.js", { create: true });
    var w = await fh.createWritable();
    await w.write(text);
    await w.close();
  }

  async function persist(list, okFolder, okDownload) {
    var text = buildPostsJs(list);
    if (dirHandle) {
      await writeToFolder(text);
      setStatus(okFolder, "ok");
    } else {
      download("posts.js", text);
      setStatus(okDownload, "ok");
    }
  }

  function validate() {
    if (!R.parseDate(current.start)) return "Chưa chọn ngày đầu tuần.";
    var w = parseInt(current.week, 10), y = parseInt(current.year, 10);
    if (!(w >= 1 && w <= 53)) return "Số tuần phải từ 1 đến 53.";
    if (!(y >= 2000 && y <= 2100)) return "Năm chưa hợp lệ.";
    if (!String(current.title).trim()) return "Chưa có tiêu đề.";
    return "";
  }

  $("btn-save").addEventListener("click", async function () {
    var err = validate();
    if (err) { setStatus(err, "err"); return; }

    var p = copy(current);
    p.year = parseInt(p.year, 10);
    p.week = parseInt(p.week, 10);
    p.title = String(p.title).trim();
    p.id = R.postId(p.year, p.week);

    var clash = posts.filter(function (x) { return x.id === p.id && x.id !== originalId; })[0];
    if (clash && !confirm("Đã có bài Tuần " + p.week + "/" + p.year + " (" + (clash.title || "") + "). Ghi đè bài đó?")) return;

    var next = posts.filter(function (x) { return x.id !== p.id && x.id !== originalId; });
    next.push(p);
    next.sort(byStartDesc);

    try {
      await persist(next,
        "Đã lưu vào thư mục website. Mở index.html (hoặc bấm Xem bài trên trang) để xem.",
        "Đã tải file posts.js. Chép đè vào thư mục data của website, rồi mở lại index.html.");
    } catch (e) {
      setStatus("Không lưu được: " + e.message, "err");
      return;
    }

    var msg = $("status").textContent, kind = $("status").className;
    posts = next;
    clearDraft();
    load(p, p.id);
    $("status").textContent = msg;
    $("status").className = kind;
  });

  $("btn-delete").addEventListener("click", async function () {
    if (!originalId) return;
    if (!confirm("Xóa hẳn bài này khỏi website? Không hoàn tác được.")) return;
    var next = posts.filter(function (x) { return x.id !== originalId; });
    try {
      await persist(next, "Đã xóa bài và cập nhật thư mục website.", "Đã tải file posts.js (đã bỏ bài này). Chép đè vào thư mục data.");
    } catch (e) {
      setStatus("Không xóa được: " + e.message, "err");
      return;
    }
    var msg = $("status").textContent, kind = $("status").className;
    posts = next;
    clearDraft();
    load(blankPost(), null);
    $("status").textContent = msg;
    $("status").className = kind;
  });

  $("btn-new").addEventListener("click", function () {
    if (isDirty() && !confirm("Bài đang soạn chưa lưu sẽ bị bỏ. Tiếp tục?")) return;
    clearDraft();
    load(blankPost(), null);
    setStatus("");
  });

  $("sel-edit").addEventListener("change", function () {
    var id = this.value;
    if (!id) return;
    if (isDirty() && !confirm("Bài đang soạn chưa lưu sẽ bị thay thế. Tiếp tục?")) {
      this.value = originalId || "";
      return;
    }
    var p = posts.filter(function (x) { return x.id === id; })[0];
    if (p) { clearDraft(); load(copy(p), p.id); setStatus("Đang sửa Tuần " + p.week + "/" + p.year + "."); }
  });

  /* ---------- Nối thư mục website (Chrome, Edge) ---------- */

  if (!window.showDirectoryPicker) {
    $("btn-folder").disabled = true;
    $("folder-note").textContent = "Trình duyệt này không lưu thẳng vào thư mục được (dùng Chrome hoặc Edge trên máy tính). " +
      "Bạn vẫn lưu bình thường: bấm Lưu bài để tải posts.js về, rồi chép đè vào thư mục data.";
  }

  $("btn-folder").addEventListener("click", async function () {
    try {
      var h = await window.showDirectoryPicker({ mode: "readwrite" });
      try {
        await h.getFileHandle("index.html");
      } catch (e) {
        if (!confirm("Thư mục này không có file index.html. Vẫn dùng làm thư mục website?")) return;
      }
      dirHandle = h;
      try {
        var dd = await h.getDirectoryHandle("data");
        var fh = await dd.getFileHandle("posts.js");
        var arr = parsePostsJs(await (await fh.getFile()).text());
        if (arr) { posts = arr; renderSelect(); }
      } catch (e) { /* chưa có data/posts.js: sẽ được tạo khi lưu */ }
      $("folder-note").textContent = "Đang nối với thư mục: " + h.name + ". Bấm Lưu bài sẽ ghi thẳng vào data/posts.js.";
      setStatus("Đã nối thư mục website.", "ok");
    } catch (e) {
      if (e && e.name !== "AbortError") setStatus("Không mở được thư mục: " + e.message, "err");
    }
  });

  /* ---------- Khởi động ---------- */

  var draft = loadDraft();
  if (draft && draft.post) {
    load(draft.post, draft.originalId);
    snapshot = "";
    setStatus("Đã khôi phục bản nháp chưa lưu từ lần soạn trước. Bấm Bài mới nếu muốn bỏ.");
  } else {
    load(blankPost(), null);
  }
})();

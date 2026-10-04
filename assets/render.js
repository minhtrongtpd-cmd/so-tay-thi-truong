/* Các hàm dùng chung cho trang đọc (index.html) và trang soạn bài (soan-bai.html).
   Bạn không cần sửa file này. */
(function (root) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /* Định dạng trong dòng: **đậm**, *nghiêng*, [chữ](https://liên-kết) */
  function inline(text) {
    var s = esc(text);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    return s;
  }

  /* Biến văn bản thường thành HTML:
     - dòng trống = đoạn mới
     - các dòng bắt đầu bằng "- " = gạch đầu dòng
     - dòng "## Tiêu đề" = tiêu đề nhỏ */
  function blocks(body) {
    var out = [];
    String(body || "")
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .forEach(function (chunk) {
        chunk = chunk.trim();
        if (!chunk) return;
        var lines = chunk.split("\n");
        var bullet = /^\s*[-•]\s+/;
        if (lines.every(function (l) { return bullet.test(l); })) {
          out.push("<ul>" + lines.map(function (l) {
            return "<li>" + inline(l.replace(bullet, "")) + "</li>";
          }).join("") + "</ul>");
        } else if (lines.length === 1 && /^##\s+/.test(chunk)) {
          out.push("<h3>" + inline(chunk.replace(/^##\s+/, "")) + "</h3>");
        } else {
          out.push("<p>" + lines.map(inline).join("<br>") + "</p>");
        }
      });
    return out.join("");
  }

  function parseDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function toIso(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function fmtDM(d) {
    return d.getDate() + "/" + (d.getMonth() + 1);
  }

  function fmtDMY(d) {
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function weekRange(p) {
    var s = parseDate(p && p.start);
    if (!s) return "";
    return fmtDM(s) + " – " + fmtDMY(addDays(s, 6));
  }

  /* Số tuần theo chuẩn ISO (tuần bắt đầu thứ Hai) */
  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var y = t.getUTCFullYear();
    var yearStart = new Date(Date.UTC(y, 0, 1));
    return { week: Math.ceil(((t - yearStart) / 86400000 + 1) / 7), year: y };
  }

  function postId(year, week) {
    return year + "-tuan-" + pad(week);
  }

  function readMinutes(p) {
    var parts = [p.sapo || "", p.tacn || ""];
    (p.sections || []).forEach(function (s) {
      parts.push(s.heading || "", s.body || "");
    });
    var words = parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function postHeader(p) {
    var meta = ["<span>Đọc khoảng " + readMinutes(p) + " phút</span>"];
    var pub = parseDate(p.published);
    if (pub) meta.push("<span>Đăng " + fmtDMY(pub) + "</span>");
    var cats = (p.categories || []).join(" · ");
    if (cats) meta.push("<span>" + esc(cats) + "</span>");
    return (
      '<div class="post-kicker">Tuần ' + esc(p.week) + " · " + esc(weekRange(p)) + "</div>" +
      '<h1 class="post-title">' + (p.title ? esc(p.title) : '<span class="ph">(Chưa có tiêu đề)</span>') + "</h1>" +
      (p.sapo ? '<p class="post-sapo">' + inline(p.sapo) + "</p>" : "") +
      '<div class="post-meta">' + meta.join("") + "</div>"
    );
  }

  function postBody(p) {
    var site = root.SITE || {};
    var h = "";

    var rows = (p.table || []).filter(function (r) {
      return r && (r.asset || r.close || r.change || r.view);
    });
    if (rows.length) {
      h += "<h2>Bảng giá cuối tuần</h2>" +
        '<div class="tbl-wrap"><table class="t"><thead><tr>' +
        "<th>Tài sản</th><th>Đóng cửa</th><th>Biến động tuần</th><th>Nhận định</th>" +
        "</tr></thead><tbody>" +
        rows.map(function (r) {
          return "<tr><td>" + esc(r.asset) + "</td><td>" + esc(r.close) + "</td><td>" +
            esc(r.change) + "</td><td>" + esc(r.view) + "</td></tr>";
        }).join("") +
        "</tbody></table></div>";
    }

    var n = 0;
    (p.sections || []).forEach(function (s) {
      if (!s || (!s.heading && !s.body)) return;
      n += 1;
      if (s.heading) h += "<h2>" + n + ". " + esc(s.heading) + "</h2>";
      h += blocks(s.body);
    });

    if (p.tacn && String(p.tacn).trim()) {
      h += '<div class="callout"><div class="callout-label">' +
        esc(site.tacnLabel || "Góc ngành thức ăn chăn nuôi") + "</div>" + blocks(p.tacn) + "</div>";
    }

    if (site.disclaimer) h += '<p class="disclaimer">' + esc(site.disclaimer) + "</p>";
    return h;
  }

  function applyTheme(site) {
    if (site && site.accent && root.document) {
      root.document.documentElement.style.setProperty("--accent", site.accent);
    }
  }

  var api = {
    esc: esc, inline: inline, blocks: blocks, parseDate: parseDate, toIso: toIso,
    addDays: addDays, fmtDM: fmtDM, fmtDMY: fmtDMY, weekRange: weekRange,
    isoWeek: isoWeek, postId: postId, readMinutes: readMinutes,
    postHeader: postHeader, postBody: postBody, applyTheme: applyTheme
  };

  root.Render = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

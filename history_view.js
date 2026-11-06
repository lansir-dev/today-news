// 历史视图：嵌进 today.html 的「历史」tab
// 依赖：window.NEWS_ARCHIVE（archive/all.js）+ 页面里的 #hist 容器
(function () {
  var A = window.NEWS_ARCHIVE || [];
  if (!A.length) return;

  var cur = null;          // null = 全部
  var kw = "";
  var MAX = 400;           // 单次最多渲染条数，防 3000 条卡死

  var host = document.getElementById("hist");
  if (!host) return;

  host.innerHTML =
    '<div class="hwrap">' +
    '  <div class="hsearch"><input id="hq" placeholder="搜索全部历史（标题 / 来源，空格分词）" autocomplete="off">' +
    '    <span class="hkbd">/</span></div>' +
    '  <div class="hdays" id="hdays"></div>' +
    '  <div class="hhead"><h2 id="httl">全部</h2><span class="hcnt" id="hcnt"></span></div>' +
    '  <ul class="hlist" id="hlist"></ul>' +
    '  <div class="hmore" id="hmore"></div>' +
    "</div>";

  function esc(s) {
    return (s || "").replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }
  function hi(s, words) {
    var o = esc(s);
    words.forEach(function (w) {
      if (!w) return;
      var e = esc(w);
      o = o.split(e).join("<mark>" + e + "</mark>");
    });
    return o;
  }
  function all() {
    var out = [];
    A.forEach(function (d) {
      d.items.forEach(function (x) {
        out.push({ d: d.day, t: x.t, u: x.u, p: x.p, s: x.s });
      });
    });
    return out;
  }
  var ALL = all();

  function render() {
    var words = kw.trim().split(/\s+/).filter(Boolean);
    var rows = cur ? ALL.filter(function (x) { return x.d === cur; }) : ALL;
    if (words.length) {
      rows = rows.filter(function (x) {
        var s = (x.t + " " + x.s + " " + x.p).toLowerCase();
        return words.every(function (w) { return s.indexOf(w.toLowerCase()) >= 0; });
      });
    }
    document.getElementById("httl").textContent = cur ? cur : (kw ? "搜索结果" : "全部");
    document.getElementById("hcnt").textContent = rows.length + " 条";
    var show = rows.slice(0, MAX);
    document.getElementById("hlist").innerHTML = show.length
      ? show.map(function (x) {
          return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + hi(x.t, words) + "</a>" +
            '<div class="hm"><span>' + esc(x.s) + "</span><i>·</i><span>" + esc(x.p || x.d) + "</span></div></li>";
        }).join("")
      : '<li class="hempty">没有匹配的条目</li>';
    document.getElementById("hmore").textContent =
      rows.length > MAX ? "只显示前 " + MAX + " 条，输入关键词缩小范围" : "";
  }

  function renderDays() {
    var box = document.getElementById("hdays");
    var html = '<button class="hd' + (cur ? "" : " on") + '" data-d="">全部<span>' + ALL.length + "</span></button>";
    A.forEach(function (d) {
      html += '<button class="hd' + (cur === d.day ? " on" : "") + '" data-d="' + d.day + '">' +
        d.day.slice(5) + "<span>" + d.items.length + "</span></button>";
    });
    box.innerHTML = html;
    Array.prototype.forEach.call(box.querySelectorAll(".hd"), function (b) {
      b.onclick = function () {
        cur = b.getAttribute("data-d") || null;
        document.getElementById("hq").value = "";
        kw = "";
        renderDays();
        render();
      };
    });
  }

  var q = document.getElementById("hq");
  q.oninput = function (e) { kw = e.target.value; render(); };

  // "/" 聚焦搜索；Esc 清空
  document.addEventListener("keydown", function (e) {
    var histOn = !document.getElementById("hist").classList.contains("hide");
    if (!histOn) return;
    if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (e.key === "Escape") { q.value = ""; kw = ""; q.blur(); render(); }
  });

  renderDays();
  render();
  window.__histReady = true;
})();

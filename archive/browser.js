// 要闻归档浏览页逻辑：左侧日期、右侧条目、顶部搜索
var A = window.NEWS_ARCHIVE || [];
var cur = null, kw = "";

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

function itemsOf() {
  var out = [];
  A.forEach(function (d) {
    d.items.forEach(function (x) {
      out.push({ d: d.day, t: x.t, u: x.u, p: x.p, s: x.s });
    });
  });
  return out;
}

function render() {
  var all = itemsOf();
  var words = kw.trim().split(/\s+/).filter(Boolean);
  var rows = cur ? all.filter(function (x) { return x.d === cur; }) : all;
  if (words.length) {
    rows = rows.filter(function (x) {
      var s = (x.t + " " + x.s + " " + x.p).toLowerCase();
      return words.every(function (w) { return s.indexOf(w.toLowerCase()) >= 0; });
    });
  }
  document.getElementById("ttl").textContent = cur ? cur : (kw ? "搜索结果" : "全部");
  document.getElementById("cnt").textContent = rows.length + " 条";
  document.getElementById("list").innerHTML = rows.length
    ? rows.map(function (x) {
        return '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + hi(x.t, words) + "</a>" +
          '<div class="meta">' + esc(x.d) + "　" + esc(x.p) + "　" + esc(x.s) + "</div></li>";
      }).join("")
    : '<div class="empty">没有匹配的条目</div>';
}

function renderDays() {
  var box = document.getElementById("days");
  box.innerHTML = "";
  var allBtn = document.createElement("div");
  allBtn.className = "day" + (cur ? "" : " on");
  allBtn.innerHTML = "<b>全部</b><span>" + itemsOf().length + "</span>";
  allBtn.onclick = function () { cur = null; renderDays(); render(); };
  box.appendChild(allBtn);
  A.forEach(function (d) {
    var el = document.createElement("div");
    el.className = "day" + (cur === d.day ? " on" : "");
    el.innerHTML = "<b>" + d.day + "</b><span>" + d.items.length + "</span>";
    el.onclick = function () {
      cur = d.day;
      document.getElementById("q").value = "";
      kw = "";
      renderDays();
      render();
    };
    box.appendChild(el);
  });
  document.getElementById("sum").textContent = A.length + " 天 · " + itemsOf().length + " 条";
}

document.getElementById("q").oninput = function (e) { kw = e.target.value; render(); };
renderDays();
render();

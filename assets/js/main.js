/* ============================================================
   XÀ LƠ XỜ LAM — main.js
   ============================================================
   ▼▼▼ 3 CHỖ CẦN SỬA, NẰM NGAY DƯỚI ĐÂY ▼▼▼
   1. SHEET_API   — dán link Apps Script (.../exec) vào
   2. PRODUCTS    — sửa giá + size từng hũ
   3. SHIPPING    — sửa hình thức nhận hàng + phí ship
   Sửa xong bấm Ctrl+S rồi F5 lại trang là ăn ngay.
   ============================================================ */

/* ---------- 1. LINK GOOGLE SHEET ---------- */
// Để trống "" thì web vẫn chạy, nhưng đơn sẽ KHÔNG vào Sheet
// (khách sẽ được đưa nội dung đơn để copy gửi qua Facebook/Zalo).
const SHEET_API = "https://script.google.com/macros/s/AKfycbxH_B3qTC95cl0M6O3OswUuc7eyXVCGQ11cyVBOtDccdl3Fo-4d34vvfbQEgbCnaTu5/exec";

/* ---------- 2. SẢN PHẨM ---------- */
// ⚠️ GIÁ HIỆN TẠI LÀ GIÁ TẠM — nhớ sửa lại cho đúng!
const PRODUCTS = [
  {
    id: "che-buoi",
    name: "Chè bưởi",
    size: "Hũ size L",
    price: 55000,                       // ⚠️ sửa giá
    img: "assets/img/sp-che-buoi.jpg",
    tag: "GIÒN RÀO RÀO",
    desc: "Clear slime vàng cam trong veo, lấm tấm hạt bưởi giòn tan. Bóp một cái nghe rào rào y như đang khuấy cốc chè đá.",
    stock: true                          // để false nếu hết hàng
  },
  {
    id: "ca-phe-muoi",
    name: "Cà phê muối",
    size: "Hũ size L",
    price: 55000,                       // ⚠️ sửa giá
    img: "assets/img/sp-ca-phe-muoi.jpg",
    tag: "MƯỢT NHƯ FOAM",
    desc: "Butter slime nâu kem, mặn mòi vibe cà phê vỉa hè. Kéo mượt như lớp foam muối, thơm đến mức suýt uống nhầm.",
    stock: true
  },
  {
    id: "sua-chua-tran-chau",
    name: "Sữa chua trân châu",
    size: "Hũ size L",
    price: 60000,                       // ⚠️ sửa giá
    img: "assets/img/sp-sua-chua-tran-chau.jpg",
    tag: "LỘP BỘP",
    desc: "Cloud creamy trắng ngần, trân châu bi lăn lộp bộp bên trong. Bóp bụp bụp, kéo ra dẻo, vo lại tròn xoe.",
    stock: true
  },
  {
    id: "sua-dau",
    name: "Sữa dâu",
    size: "Hũ size L",
    price: 55000,                       // ⚠️ sửa giá
    img: "assets/img/sp-sua-dau.jpg",
    tag: "CHỮA LÀNH",
    desc: "Hồng phấn thơm dâu, mềm mịn như ly sữa dâu đá xay. Loại này bóp xong là hết cáu, thật đấy.",
    stock: true
  },
  {
    id: "xoi-com",
    name: "Xôi cốm",
    size: "Hũ size L",
    price: 60000,                       // ⚠️ sửa giá
    img: "assets/img/sp-xoi-com.jpg",
    tag: "DẺO QUÁNH",
    desc: "Xanh cốm non, lợn cợn hạt cốm dẻo, thoang thoảng mùi lá sen. Mùa thu Hà Nội đóng gọn trong một hũ.",
    stock: true
  }
];

/* ---------- 3. HÌNH THỨC NHẬN HÀNG ---------- */
// ⚠️ SỬA LẠI CHO ĐÚNG khu vực & phí ship của shop
const SHIPPING = [
  { id: "tainoi", label: "Nhận trực tiếp tại phố Vọng", fee: 0,     needAddress: false },
  { id: "hanoi",  label: "Ship nội thành Hà Nội",       fee: 20000, needAddress: true  },
  { id: "tinh",   label: "Ship tỉnh khác (GHTK/VNPost)", fee: 35000, needAddress: true  }
];

/* ============================================================
   TỪ ĐÂY TRỞ XUỐNG KHÔNG CẦN SỬA
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => n.toLocaleString("vi-VN") + "đ";

const cart = new Map();          // id -> số lượng
let shipId = null;

/* ---------- khôi phục giỏ hàng cũ ---------- */
try {
  const saved = JSON.parse(localStorage.getItem("xlxl-cart") || "[]");
  saved.forEach(([id, q]) => {
    if (PRODUCTS.some(p => p.id === id && p.stock) && q > 0) cart.set(id, q);
  });
} catch (e) { /* không sao, bỏ qua */ }

function saveCart() {
  try { localStorage.setItem("xlxl-cart", JSON.stringify([...cart])); } catch (e) {}
}

/* ============================================================
   ÂM THANH KHI BẤM NÚT
   Tiếng được tổng hợp bằng Web Audio ngay trong trình duyệt,
   không cần file mp3 nào -> web vẫn nhẹ, chạy được cả khi offline.
   Khách bấm nút loa 🔊 trên thanh menu để tắt/bật (nhớ lựa chọn).
   Muốn chỉnh to/nhỏ: sửa số `vol` trong từng tiếng bên dưới.
   ============================================================ */
const Sfx = (function () {
  let ctx = null;
  let on = true;
  try { on = localStorage.getItem("xlxl-sound") !== "off"; } catch (e) {}

  function ac() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;                       // trình duyệt quá cũ -> im lặng
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /* một nốt trượt cao độ */
  function tone(freq, toFreq, type, dur, vol, delay) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, toFreq), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }

  /* tiếng "xì xoẹt" — nhiễu lọc băng thông, dùng cho tiếng bóp slime */
  function noise(dur, vol, from, to, q) {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t); src.stop(t + dur);
  }

  const api = {
    isOn: () => on,
    toggle() {
      on = !on;
      try { localStorage.setItem("xlxl-sound", on ? "on" : "off"); } catch (e) {}
      if (on) api.pop();                       // bật thì kêu 1 tiếng cho biết
      return on;
    },
    pop()    { if (on) tone(640, 210, "sine", 0.13, 0.26, 0); },              // nút chung
    plus()   { if (on) { tone(520, 900, "triangle", 0.10, 0.22, 0); } },      // thêm hũ
    minus()  { if (on) { tone(520, 240, "triangle", 0.10, 0.18, 0); } },      // bớt hũ
    tick()   { if (on) tone(1150, 850, "square", 0.04, 0.07, 0); },           // link menu
    squish() {                                                               // bóp slime
      if (!on) return;
      noise(0.26, 0.13, 1800, 260, 1.2);
      tone(300, 120, "sine", 0.22, 0.20, 0.02);
    },
    ok() {                                                                   // chốt đơn thành công
      if (!on) return;
      tone(660, 660, "triangle", 0.12, 0.20, 0);
      tone(880, 880, "triangle", 0.12, 0.20, 0.11);
      tone(1320, 1320, "triangle", 0.26, 0.18, 0.22);
    },
    err() { if (on) { tone(240, 180, "sawtooth", 0.18, 0.14, 0); } }          // form thiếu thông tin
  };
  return api;
})();

/* nút loa trên thanh menu */
const soundBtn = $("#navSound");
function paintSoundBtn() {
  soundBtn.textContent = Sfx.isOn() ? "🔊" : "🔇";
  soundBtn.setAttribute("aria-pressed", String(Sfx.isOn()));
  soundBtn.title = Sfx.isOn() ? "Tắt âm thanh" : "Bật âm thanh";
}
soundBtn.addEventListener("click", () => { Sfx.toggle(); paintSoundBtn(); });
paintSoundBtn();

/* bấm nút bất kỳ là có tiếng */
document.addEventListener("click", e => {
  if (e.target.closest("#navSound")) return;                 // nút loa tự lo phần tiếng của nó
  if (e.target.closest("[data-squish]"))              return Sfx.squish();
  if (e.target.closest("[data-plus]"))                return Sfx.plus();
  if (e.target.closest("[data-minus], [data-del]"))   return Sfx.minus();
  if (e.target.closest(".nav__links a, .menu__link, .strip__item, .menu__all")) return Sfx.tick();
  if (e.target.closest("button, .btn, .ship, .qty__btn"))    return Sfx.pop();
});

/* ---------- BĂNG SẢN PHẨM TREO ---------- */
$("#strip").innerHTML = PRODUCTS.map(p => `
  <a class="strip__item" href="#shop">
    <img src="${p.img}" alt="Slime ${p.name}" loading="lazy">
    <span>${p.name.toUpperCase()}</span>
  </a>`).join("");

/* ---------- DANH SÁCH MENU ---------- */
$("#menuList").innerHTML = PRODUCTS.map((p, i) => `
  <li class="menu__row">
    <a class="menu__link" href="#shop" data-img="${p.img}">
      ${p.name.toUpperCase()} <em>(${String(i + 1).padStart(2, "0")})</em>
      <b>${p.stock ? money(p.price) : "TẠM HẾT"}</b>
    </a>
  </li>`).join("");

const peek = $("#menuPeek");
$$(".menu__link").forEach(a => {
  a.addEventListener("mouseenter", () => {
    peek.querySelector("img").src = a.dataset.img;
    peek.classList.add("is-on");
  });
  a.addEventListener("mouseleave", () => peek.classList.remove("is-on"));
});
$("#menuList").addEventListener("mousemove", e => {
  peek.style.left = e.clientX + "px";
  peek.style.top  = e.clientY + "px";
});

/* ---------- LƯỚI SẢN PHẨM ---------- */
$("#grid").innerHTML = PRODUCTS.map(p => `
  <article class="card" id="card-${p.id}">
    <div class="card__pic" data-squish>
      <img src="${p.img}" alt="Slime ${p.name}" loading="lazy">
      <span class="card__squeal">bụp!</span>
    </div>
    <div class="card__body">
      <h3 class="card__name">${p.name}</h3>
      <p class="card__meta">${p.tag} · ${p.size}</p>
      <p class="card__desc">${p.desc}</p>
      <p class="card__price">${p.stock ? money(p.price) : "Tạm hết hàng"} <small>${p.stock ? "/ hũ" : ""}</small></p>
      ${p.stock ? `
      <div class="qty">
        <button class="qty__btn" type="button" data-minus="${p.id}" aria-label="Bớt 1 hũ ${p.name}">−</button>
        <span class="qty__val" data-val="${p.id}">0</span>
        <button class="qty__btn" type="button" data-plus="${p.id}" aria-label="Thêm 1 hũ ${p.name}">+</button>
      </div>
      <p class="qty__sub" data-sub="${p.id}"></p>` : ""}
    </div>
  </article>`).join("");

/* bóp thử */
$$("[data-squish]").forEach(el => {
  el.addEventListener("click", () => {
    el.classList.remove("squish");
    void el.offsetWidth;                       // ép trình duyệt chạy lại animation
    el.classList.add("squish");
  });
});

/* nút +/- */
$("#grid").addEventListener("click", e => {
  const plus  = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  if (plus)  setQty(plus.dataset.plus,  (cart.get(plus.dataset.plus)  || 0) + 1);
  if (minus) setQty(minus.dataset.minus, (cart.get(minus.dataset.minus) || 0) - 1);
});

function setQty(id, q) {
  q = Math.max(0, Math.min(99, q));
  if (q === 0) cart.delete(id); else cart.set(id, q);
  saveCart();
  render();
}

/* ---------- HÌNH THỨC NHẬN HÀNG ---------- */
$("#ships").innerHTML = SHIPPING.map(s => `
  <label class="ship" data-ship="${s.id}">
    <input type="radio" name="ship" value="${s.id}">
    <span>${s.label}</span>
    <b>${s.fee === 0 ? "Miễn phí" : "+" + money(s.fee)}</b>
  </label>`).join("");

$("#ships").addEventListener("change", e => {
  shipId = e.target.value;
  $$(".ship").forEach(l => l.classList.toggle("is-on", l.dataset.ship === shipId));
  const s = SHIPPING.find(x => x.id === shipId);
  $("#addrField").hidden = !s.needAddress;
  clearErr("ship");
  render();
});

/* ---------- RENDER ---------- */
function lines() {
  return [...cart].map(([id, q]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return { ...p, qty: q, sum: p.price * q };
  });
}
function goodsTotal() { return lines().reduce((t, l) => t + l.sum, 0); }
function shipFee()    { const s = SHIPPING.find(x => x.id === shipId); return s ? s.fee : 0; }
function grandTotal() { return goodsTotal() + (cart.size ? shipFee() : 0); }
function itemCount()  { return [...cart.values()].reduce((t, q) => t + q, 0); }

function render() {
  // lưới
  PRODUCTS.forEach(p => {
    const q = cart.get(p.id) || 0;
    const val = $(`[data-val="${p.id}"]`);
    if (val) val.textContent = q;
    const sub = $(`[data-sub="${p.id}"]`);
    if (sub) sub.textContent = q ? `${q} hũ = ${money(p.price * q)}` : "";
    const card = $(`#card-${p.id}`);
    if (card) card.classList.toggle("is-in", q > 0);
  });

  // giỏ hàng
  const ls = lines();
  $("#cartList").innerHTML = ls.length
    ? ls.map(l => `
      <li class="cart__row">
        <img src="${l.img}" alt="">
        <span class="cart__row-name">${l.name}<span>${l.qty} × ${money(l.price)}</span></span>
        <span class="cart__row-price">${money(l.sum)}</span>
        <button class="cart__row-del" type="button" data-del="${l.id}" aria-label="Xoá ${l.name}">✕</button>
      </li>`).join("")
    : `<li class="cart__empty">Chưa có gì trong giỏ. Kéo lên trên chọn vài hũ đi cậu ơi 🫠</li>`;

  $("#sumGoods").textContent = money(goodsTotal());
  $("#sumShip").textContent  = !cart.size ? "—" : (shipId ? (shipFee() ? money(shipFee()) : "Miễn phí") : "chọn hình thức nhận");
  $("#sumTotal").textContent = money(grandTotal());

  // nav + dock
  $("#navCartCount").textContent = itemCount();
  $("#navCartTotal").textContent = money(grandTotal());
  $("#dockCount").textContent    = itemCount() + " hũ";
  $("#dockTotal").textContent    = money(grandTotal());
  $("#dock").hidden = itemCount() === 0;
}

$("#cartList").addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if (del) setQty(del.dataset.del, 0);
});
$("#navCart").addEventListener("click", () => {
  document.getElementById(cart.size ? "order" : "shop").scrollIntoView({ behavior: "smooth" });
});

/* ---------- VALIDATE ---------- */
function showErr(key, msg) {
  const box = $(`[data-err="${key}"]`);
  if (box) box.textContent = msg;
  const input = { name: "#fName", phone: "#fPhone", email: "#fEmail", address: "#fAddr" }[key];
  if (input) $(input).classList.add("is-bad");
}
function clearErr(key) {
  const box = $(`[data-err="${key}"]`);
  if (box) box.textContent = "";
  const input = { name: "#fName", phone: "#fPhone", email: "#fEmail", address: "#fAddr" }[key];
  if (input) $(input).classList.remove("is-bad");
}
["name", "phone", "email", "address"].forEach(k => {
  const input = { name: "#fName", phone: "#fPhone", email: "#fEmail", address: "#fAddr" }[k];
  $(input).addEventListener("input", () => clearErr(k));
});

function validate() {
  ["name", "phone", "email", "address", "ship"].forEach(clearErr);
  let ok = true;

  const name  = $("#fName").value.trim();
  const phone = $("#fPhone").value.replace(/[\s.\-()]/g, "");
  const email = $("#fEmail").value.trim();
  const ship  = SHIPPING.find(s => s.id === shipId);
  const addr  = $("#fAddr").value.trim();

  if (!cart.size) {
    msg("Giỏ đang trống — chọn ít nhất 1 hũ đã nha!", "bad");
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    return null;
  }
  if (name.length < 2)                                { showErr("name",  "Cho tụi tớ xin cái tên với ạ."); ok = false; }
  if (!/^(0|\+84)\d{8,10}$/.test(phone))              { showErr("phone", "Số điện thoại chưa đúng (vd: 0912345678)."); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))   { showErr("email", "Email chưa đúng định dạng."); ok = false; }
  if (!ship)                                          { showErr("ship",  "Chọn giúp tụi tớ cách nhận hàng nhé."); ok = false; }
  if (ship && ship.needAddress && addr.length < 8)    { showErr("address", "Ghi rõ địa chỉ để shipper còn tìm được."); ok = false; }

  if (!ok) { msg("Còn vài ô chưa ổn, cậu xem lại giúp tớ nha.", "bad"); return null; }

  return {
    orderId: makeId(),
    time: new Date().toLocaleString("vi-VN"),
    name, phone, email,
    shipMethod: ship.label,
    shipFee: ship.fee,
    address: ship.needAddress ? addr : "(nhận trực tiếp)",
    note: $("#fNote").value.trim(),
    items: lines().map(l => `${l.name} x${l.qty}`).join(", "),
    itemCount: itemCount(),
    goods: goodsTotal(),
    total: grandTotal()
  };
}

function makeId() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `XL${p(d.getDate())}${p(d.getMonth() + 1)}-${r}`;
}

function msg(text, cls = "") {
  const el = $("#formMsg");
  el.textContent = text;
  el.className = "form__msg " + cls;
}

/* ---------- GỬI ĐƠN ---------- */
$("#orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = validate();
  if (!data) { Sfx.err(); return; }

  const btn = $("#submitBtn");
  btn.disabled = true;
  msg("Đang gửi đơn cho Xà & Lơ…");

  let sent = false;
  if (SHEET_API) {
    try {
      await fetch(SHEET_API, {
        method: "POST",
        mode: "no-cors",                       // Apps Script không trả CORS header
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      sent = true;
    } catch (err) {
      sent = false;
    }
  }

  if (sent) {
    success(data);
  } else {
    btn.disabled = false;
    fallback(data);
  }
});

function success(d) {
  Sfx.ok();
  $("#orderForm").innerHTML = `
    <div class="done">
      <h3>Chốt đơn rồi nha!</h3>
      <p class="done__code">${d.orderId}</p>
      <p><b>${d.name}</b> · ${d.phone}<br>${d.shipMethod}</p>
      <p>${d.items}<br><b>Tổng: ${money(d.total)}</b></p>
      <p style="opacity:.7;font-size:.85rem">Tụi tớ sẽ gọi/nhắn xác nhận trong hôm nay.
      Nhớ nha: <b>bóp thôi, đừng ăn</b> 🫡</p>
      <button class="btn btn--yellow" type="button" onclick="location.reload()">ĐẶT THÊM HŨ NỮA</button>
    </div>`;
  cart.clear();
  saveCart();
  render();
}

function fallback(d) {
  const text =
`ĐƠN HÀNG ${d.orderId}
Tên: ${d.name}
SĐT: ${d.phone}
Email: ${d.email}
Nhận hàng: ${d.shipMethod}
Địa chỉ: ${d.address}
Món: ${d.items}
Tiền hàng: ${money(d.goods)} | Ship: ${money(d.shipFee)}
TỔNG: ${money(d.total)}
Ghi chú: ${d.note || "—"}`;

  navigator.clipboard?.writeText(text).catch(() => {});
  msg("Chưa nối được Google Sheet. Nội dung đơn đã copy vào clipboard — cậu dán vào tin nhắn Facebook/Zalo của shop giúp tụi tớ nhé!", "bad");
  console.log(text);
}

/* ---------- LẶT VẶT ---------- */
$("#year").textContent = new Date().getFullYear();
render();

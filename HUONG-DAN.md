# Web Xà Lơ Xờ Lam — hướng dẫn

Mở web: bấm đúp vào **`index.html`**.

---

## 1. Cấu trúc thư mục

```
7. Web Xà Lơ Xờ Lam\
├─ index.html                 ← trang web
├─ google-apps-script.gs      ← code dán vào Google Sheet (xem mục 3)
├─ HUONG-DAN.md               ← file này
└─ assets\
   ├─ css\style.css           ← giao diện
   ├─ js\main.js              ← ⚠️ CHỖ SỬA GIÁ / SHIP / LINK SHEET
   ├─ choret_fudyng_bubble\   ← font bubble của brand
   └─ img\
      ├─ banner.png, logo.png, mascot.png, typo.png, brand-guideline.png
      ├─ sp-*.jpg             ← 5 ảnh sản phẩm (đã nén nhẹ)
      └─ goc\                 ← ẢNH GỐC chưa nén, giữ để in ấn
```

> Ảnh gốc 3024×4032 (~4 MB/tấm, tổng 23 MB) đã được nén xuống 900×1200 (~70 KB/tấm)
> để web load nhanh trên điện thoại. Bản gốc vẫn nằm nguyên trong `assets\img\goc\`.

---

## 2. Sửa giá, size, hình thức ship

Mở **`assets\js\main.js`** bằng Notepad (hoặc VS Code). Ba khối cần sửa nằm ngay đầu file:

**a) Giá sản phẩm** — trong `PRODUCTS`, sửa số ở dòng `price:` (viết liền, không dấu chấm):

```js
{ id: "che-buoi", name: "Chè bưởi", size: "Hũ size L",
  price: 55000,        // ⚠️ sửa giá ở đây
  ...
  stock: true          // đổi thành false nếu hết hàng
}
```

**b) Hình thức nhận hàng** — trong `SHIPPING`:

```js
{ id: "hanoi", label: "Ship nội thành Hà Nội", fee: 20000, needAddress: true },
```
- `fee`: phí ship, cộng thẳng vào tổng tiền. Để `0` là miễn phí.
- `needAddress: true` → khách chọn cái này thì ô "Địa chỉ" mới hiện ra và bắt buộc điền.
- Thêm/bớt dòng thoải mái, nhớ dấu phẩy cuối mỗi dòng (trừ dòng cuối cùng).

**c) Link Google Sheet** — dòng `const SHEET_API = "";` (xem mục 3).

Sửa xong bấm **Ctrl+S**, quay lại trình duyệt bấm **Ctrl+F5**.

---

## 3. Nối form vào Google Sheet

> ✅ **ĐÃ NỐI XONG ngày 01/09/2026.** Link đang dùng nằm ở dòng `SHEET_API` trong `assets\js\main.js`.
> Phần dưới đây chỉ cần đọc lại khi phải triển khai lại (đổi tài khoản, đổi Sheet, hoặc lỡ xoá bản triển khai).

Toàn bộ hướng dẫn nằm ở đầu file **`google-apps-script.gs`**. Tóm tắt:

1. Mở Google Sheet → **Tiện ích mở rộng → Apps Script**
2. Xoá code mẫu, dán toàn bộ `google-apps-script.gs` vào, bấm **Lưu**
3. **Triển khai → Tạo bản triển khai mới → Ứng dụng web**
   - Thực thi với tư cách: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai** ← thiếu bước này là đơn không vào được
4. Cho phép quyền khi Google hỏi
5. Copy **URL kết thúc bằng `/exec`**
6. Dán vào `main.js`: `const SHEET_API = "https://script.google.com/.../exec";`

Sheet sẽ tự tạo tab **"Đơn hàng"** với 14 cột: Thời gian, Mã đơn, Họ tên, SĐT, Email,
Hình thức nhận, Địa chỉ, Chi tiết đơn, Số hũ, Tiền hàng, Phí ship, TỔNG TIỀN, Ghi chú, Trạng thái.

**Kiểm tra nhanh:** mở link `/exec` trên trình duyệt, thấy dòng
`{"ok":true,"message":"Xa Lo Xo Lam order endpoint dang chay."}` là ngon.

**Nếu chưa nối Sheet:** web vẫn chạy bình thường, chỉ là khi khách bấm chốt đơn,
nội dung đơn sẽ được **tự copy vào clipboard** kèm lời nhắn dán qua Facebook/Zalo cho shop.

**Muốn nhận email mỗi khi có đơn?** Trong Sheet: `Công cụ → Quy tắc thông báo` → chọn
"Gửi ngay khi có thay đổi".

---

## 4. Thông tin liên hệ ở footer

Đã điền sẵn (sửa trong `index.html`, thẻ `<footer>` gần cuối file):

- Fanpage: https://www.facebook.com/xaloxolamneu
- Ms. Thuỳ Dương — 0386 252 005
- Ms. Khánh Huyền — 0837 196 829
- Nhận trực tiếp: phố Vọng, Hai Bà Trưng, Hà Nội

Số điện thoại để dạng link `tel:` nên khách xem bằng điện thoại **bấm vào là gọi luôn**.

---

## 5. Đưa web lên link online để gửi khách

Cách nhanh nhất, miễn phí, không cần tài khoản:

1. Vào **https://app.netlify.com/drop**
2. Kéo nguyên thư mục `7. Web Xà Lơ Xờ Lam` thả vào ô giữa trang
3. Đợi ~20 giây → được link kiểu `https://xxx-yyy.netlify.app` → gửi khách

Muốn đổi tên link đẹp hơn thì tạo tài khoản Netlify miễn phí rồi vào
`Site settings → Change site name`.

> Có thể xoá thư mục `assets\img\goc\` trước khi upload cho nhẹ (nhớ giữ 1 bản trên máy).

---

## 6. Ghi chú thiết kế

Màu và font lấy đúng từ `brand-guideline.png`:

| Vai trò | Mã màu |
|---|---|
| Nền chính | `#e6a40e` |
| Viền chữ / nền phụ | `#feec94` |
| Xanh lam (XỜ LAM) | `#313a8e` |
| Xanh rêu (XÀ.LƠ) | `#86903b` |
| Đỏ tagline | `#be0000` |

**Font:** tiêu đề lớn dùng **Baloo 2** (Google Fonts) — kiểu chữ bubble tròn giống tinh thần
logo brand nhưng **có bộ dấu tiếng Việt đầy đủ**, không lỗi dấu. Chữ đọc (mô tả, form, footer)
dùng **Be Vietnam Pro**.

Font gốc **Choret Fudyng Bubble** vẫn được giữ trong `assets\choret_fudyng_bubble\` và khai báo
sẵn trong CSS. Muốn quay lại dùng nó, sửa 1 dòng trong `assets\css\style.css`:

```css
--display: "Choret Fudyng Bubble", "Baloo 2", "Be Vietnam Pro", system-ui, sans-serif;
```

> Logo và ảnh bìa vẫn là ảnh gốc dùng chữ Choret thật, nên nhận diện thương hiệu không đổi.

---

## 7. Âm thanh khi bấm nút

Web có tiếng khi khách bấm — tiếng được **tổng hợp trực tiếp bằng Web Audio**, không dùng file
mp3 nào nên không làm web nặng thêm và chạy được cả khi mất mạng.

| Hành động | Tiếng |
|---|---|
| Bấm nút bất kỳ (CTA, chốt đơn, chọn cách nhận hàng) | "bụp" trầm |
| Bấm **+** thêm hũ | tiếng đi lên |
| Bấm **−** / xoá khỏi giỏ | tiếng đi xuống |
| Bấm vào ảnh sản phẩm | tiếng **bóp slime** (nhiễu + trầm) |
| Link menu, danh sách vị | tiếng "tách" nhẹ |
| Chốt đơn thành công | 3 nốt vui |
| Form thiếu thông tin | tiếng "è" báo lỗi |

Khách bấm nút **🔊 trên thanh menu** để tắt/bật, trình duyệt sẽ nhớ lựa chọn.

Muốn chỉnh to/nhỏ hoặc đổi tiếng: sửa các số `vol` trong khối `const Sfx = ...` ở
`assets\js\main.js`. Xoá nguyên khối đó là web im lặng hoàn toàn.

> Lưu ý: trình duyệt chỉ cho phát tiếng **sau khi khách bấm chuột lần đầu** — đây là quy định
> chung của Chrome/Safari, không phải lỗi.

# Xà Lơ Xờ Lam

> **Ăn vặt xả đói — Xờ Lam xả sầu**

Website bán hàng của **Xà Lơ Xờ Lam** — slime handmade lấy cảm hứng từ những món ăn vặt
quen mặt của phố xá Hà Nội: chè bưởi, cà phê muối, sữa chua trân châu, sữa dâu, xôi cốm.

*Nhìn thì ngon, ngửi thì đói — nhưng bóp thôi, đừng ăn.*

Bài tập môn **Brand Identity**, Đại học Kinh tế Quốc dân — kì 4.

---

## Có gì trong web

- **Giới thiệu thương hiệu** — câu chuyện của 2 mascot Xà (rắn) và Lơ (bông cải)
- **Menu 5 vị** — danh sách chữ lớn, rê chuột hiện ảnh sản phẩm
- **Khu bán hàng** — chọn số lượng từng hũ, giỏ hàng tự tính tổng tiền kèm phí ship
- **Form đặt hàng** — tên, SĐT, email, hình thức nhận hàng; đơn chảy thẳng vào Google Sheet
- **Tương tác** — bấm vào ảnh là hũ slime bị bóp méo, có tiếng "bóp" tổng hợp bằng Web Audio

Web thuần HTML/CSS/JS, không cần cài đặt gì. Mở `index.html` bằng trình duyệt là chạy.

## Cấu trúc

```
├─ index.html                 trang web
├─ google-apps-script.gs      code nhận đơn, dán vào Google Sheet
├─ HUONG-DAN.md               hướng dẫn sửa giá / ship / liên hệ / đưa lên host
└─ assets/
   ├─ css/style.css
   ├─ js/main.js              ⚠️ khối config giá & phí ship nằm ở đầu file
   ├─ choret_fudyng_bubble/   font gốc của brand
   └─ img/                    ảnh dùng cho web (bản gốc chưa nén nằm trong img/goc/)
```

## Nhận diện thương hiệu

| Vai trò | Mã màu |
|---|---|
| Nền chính | `#e6a40e` |
| Viền chữ / nền phụ | `#feec94` |
| Xanh lam (XỜ LAM) | `#313a8e` |
| Xanh rêu (XÀ.LƠ) | `#86903b` |
| Đỏ tagline | `#be0000` |

Tiêu đề dùng **Baloo 2**, chữ đọc dùng **Be Vietnam Pro** — cả hai đều có bộ dấu tiếng Việt đầy đủ.

## Liên hệ

- Fanpage: [facebook.com/xaloxolamneu](https://www.facebook.com/xaloxolamneu)
- Ms. Thuỳ Dương — 0386 252 005
- Ms. Khánh Huyền — 0837 196 829

---

⚠️ Sản phẩm là **đồ chơi slime**, không phải thực phẩm. Không ăn, không nuốt.
Tránh xa trẻ dưới 3 tuổi.

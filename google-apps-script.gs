/**
 * XÀ LƠ XỜ LAM — nhận đơn hàng từ web đổ vào Google Sheet
 *
 * CÁCH DÙNG (làm 1 lần duy nhất, ~3 phút):
 *  1. Mở Google Sheet của bạn:
 *     https://docs.google.com/spreadsheets/d/1MWljbWTHPEZLSAUVIDyz7ZmSRZp_to5ofydfMqHkUpw/edit
 *  2. Menu: Tiện ích mở rộng (Extensions) → Apps Script
 *  3. Xoá hết code mẫu trong đó, dán TOÀN BỘ file này vào, bấm Lưu (biểu tượng đĩa mềm)
 *  4. Bấm nút "Triển khai" (Deploy) → "Tạo bản triển khai mới" (New deployment)
 *  5. Bấm bánh răng cạnh "Chọn loại" → chọn "Ứng dụng web" (Web app)
 *  6. Điền:
 *        Thực thi với tư cách (Execute as)     : Tôi (Me)
 *        Ai có quyền truy cập (Who has access) : Bất kỳ ai (Anyone)   ← QUAN TRỌNG
 *  7. Bấm Triển khai → Google hỏi quyền → Cho phép (chọn tài khoản → Nâng cao →
 *     Chuyển đến ... (không an toàn) → Cho phép). Đây là script của chính bạn nên yên tâm.
 *  8. Copy dòng "URL ứng dụng web" (kết thúc bằng /exec)
 *  9. Mở file assets/js/main.js, dán vào dòng:  const SHEET_API = "dán_vào_đây";
 *
 * LƯU Ý: mỗi lần sửa file .gs này, phải Triển khai → Quản lý bản triển khai →
 * bút chì ✏️ → Phiên bản: Mới → Triển khai, thì thay đổi mới có hiệu lực.
 */

var SHEET_ID  = '1MWljbWTHPEZLSAUVIDyz7ZmSRZp_to5ofydfMqHkUpw';
var SHEET_TAB = 'Đơn hàng';

var HEADER = [
  'Thời gian', 'Mã đơn', 'Họ tên', 'SĐT', 'Email',
  'Hình thức nhận', 'Địa chỉ', 'Chi tiết đơn', 'Số hũ',
  'Tiền hàng', 'Phí ship', 'TỔNG TIỀN', 'Ghi chú', 'Trạng thái'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                       // tránh 2 đơn ghi đè nhau
  try {
    var d = JSON.parse(e.postData.contents);
    getSheet().appendRow([
      d.time || new Date(),
      d.orderId  || '',
      d.name     || '',
      "'" + (d.phone || ''),                  // dấu ' để Sheet giữ nguyên số 0 đầu
      d.email    || '',
      d.shipMethod || '',
      d.address  || '',
      d.items    || '',
      d.itemCount || 0,
      d.goods    || 0,
      d.shipFee  || 0,
      d.total    || 0,
      d.note     || '',
      'Mới'
    ]);
    return json({ ok: true, orderId: d.orderId });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Mở link /exec trên trình duyệt sẽ thấy dòng này -> biết là deploy thành công
function doGet() {
  return json({ ok: true, message: 'Xa Lo Xo Lam order endpoint dang chay.' });
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_TAB);
  if (!sh) sh = ss.insertSheet(SHEET_TAB);

  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    var head = sh.getRange(1, 1, 1, HEADER.length);
    head.setFontWeight('bold')
        .setBackground('#e6a40e')
        .setFontColor('#17130a');
    sh.setFrozenRows(1);
    sh.getRange(2, 10, sh.getMaxRows() - 1, 3).setNumberFormat('#,##0"đ"');
    [150, 100, 160, 110, 200, 200, 260, 280, 60, 110, 100, 120, 220, 100]
      .forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  }
  return sh;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Bấm Chạy hàm này 1 lần để test — sẽ thêm 1 dòng đơn giả vào Sheet. */
function testThuMotDon() {
  doPost({ postData: { contents: JSON.stringify({
    time: new Date().toLocaleString('vi-VN'),
    orderId: 'XL0101-TST', name: 'Bạn Lơ Test', phone: '0912345678',
    email: 'test@gmail.com', shipMethod: 'Ship nội thành Hà Nội', shipFee: 20000,
    address: 'Số 1 phố Vọng, Hai Bà Trưng, Hà Nội',
    items: 'Chè bưởi x2, Sữa dâu x1', itemCount: 3,
    goods: 165000, total: 185000, note: 'Đây là đơn test, xoá đi được nhé'
  }) } });
}

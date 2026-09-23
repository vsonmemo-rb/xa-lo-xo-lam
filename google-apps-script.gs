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

/**
 * CHỈ ĐÍCH DANH WORKSHEET NHẬN ĐƠN (nên điền):
 * Mở Google Sheet, bấm vào worksheet muốn nhận đơn, nhìn thanh địa chỉ:
 *   .../edit#gid=123456789   -> dán số 123456789 vào giữa 2 dấu nháy dưới đây.
 * Đã điền thì mọi đơn chỉ ghi vào đúng worksheet đó, không bao giờ tạo tab mới.
 * Để trống '' thì script tự đoán (tab tên "Đơn hàng", hoặc tab nhiều đơn nhất).
 */
var SHEET_GID = '';

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

/**
 * Tìm đúng 1 tab đơn hàng, KHÔNG dựa hoàn toàn vào tên tab.
 *
 * Bản cũ chỉ tìm theo tên 'Đơn hàng'. Tên tiếng Việt có dấu có thể bị lệch
 * mã hoá (hoặc thừa dấu cách) nên lần nào cũng "không thấy" -> tạo tab mới
 * cho mỗi đơn. Bản này tìm lần lượt:
 *   1. tab đã ghi nhớ bằng ID (không đổi kể cả khi bạn đổi tên tab)
 *   2. tab có tên giống 'Đơn hàng' (bỏ qua dấu cách, hoa/thường, kiểu mã hoá dấu)
 *   3. tab có dòng tiêu đề bắt đầu bằng 'Thời gian' (lấy tab nhiều dòng nhất)
 * Chỉ khi cả 3 cách đều không thấy mới tạo tab mới, rồi ghi nhớ ID của nó.
 */
function getSheet() {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var props = PropertiesService.getScriptProperties();
  var sheets = ss.getSheets();
  var sh = null;

  // Đã chỉ đích danh worksheet -> chỉ dùng đúng tab đó. Không thấy thì báo lỗi, TUYỆT ĐỐI không tạo tab mới.
  var gid = String(SHEET_GID).trim();
  if (gid) {
    sh = sheets.filter(function (s) { return String(s.getSheetId()) === gid; })[0] || null;
    if (!sh) throw new Error('Không tìm thấy worksheet có gid=' + gid + '. Kiểm tra lại số SHEET_GID.');
    if (sh.getLastRow() === 0) sh.appendRow(HEADER);
    return sh;
  }

  var savedId = props.getProperty('ORDER_SHEET_ID');
  if (savedId) {
    sh = sheets.filter(function (s) { return String(s.getSheetId()) === savedId; })[0] || null;
  }
  if (!sh) {
    sh = sheets.filter(function (s) { return norm(s.getName()) === norm(SHEET_TAB); })[0] || null;
  }
  if (!sh) {
    var withHeader = orderSheets(ss).sort(function (a, b) { return b.getLastRow() - a.getLastRow(); });
    sh = withHeader[0] || null;
  }
  if (!sh) sh = ss.insertSheet(SHEET_TAB);

  props.setProperty('ORDER_SHEET_ID', String(sh.getSheetId()));

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

/* chuẩn hoá tên để so sánh: cùng kiểu mã hoá dấu, bỏ dấu cách thừa, không phân biệt hoa/thường */
function norm(s) {
  s = String(s || '');
  if (s.normalize) s = s.normalize('NFC');
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

/* các tab có dòng 1 là tiêu đề đơn hàng (ô A1 = 'Thời gian', ô B1 = 'Mã đơn') */
function orderSheets(ss) {
  return ss.getSheets().filter(function (s) {
    if (s.getLastRow() < 1 || s.getLastColumn() < 2) return false;
    var h = s.getRange(1, 1, 1, 2).getValues()[0];
    return norm(h[0]) === norm(HEADER[0]) && norm(h[1]) === norm(HEADER[1]);
  });
}

/**
 * CHẠY 1 LẦN để dọn các tab bị tạo thừa.
 *
 * - Chọn 1 tab chính (tab đang được ghi nhớ, không có thì tab nhiều đơn nhất)
 * - Chép toàn bộ đơn ở các tab thừa sang cuối tab chính
 * - Xoá các tab thừa đã chép xong
 *
 * CHỈ đụng tới những tab có dòng tiêu đề đơn hàng ('Thời gian', 'Mã đơn'...).
 * Tab nào khác do bạn tự tạo thì không bị động vào.
 * Kết quả xem ở: Nhật ký thực thi.
 */
function gopTabTrungLap() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);                       // không cho đơn mới chen vào lúc đang gộp
  try {
    var list = orderSheets(ss);
    if (list.length <= 1) {
      Logger.log('Không có tab thừa. Số tab đơn hàng: ' + list.length);
      return;
    }

    var props   = PropertiesService.getScriptProperties();
    var savedId = props.getProperty('ORDER_SHEET_ID');
    var main = list.filter(function (s) { return String(s.getSheetId()) === savedId; })[0]
            || list.slice().sort(function (a, b) { return b.getLastRow() - a.getLastRow(); })[0];

    var moved = 0, removed = 0;
    list.forEach(function (s) {
      if (s.getSheetId() === main.getSheetId()) return;
      var rows = s.getLastRow() - 1;
      if (rows > 0) {
        var cols = Math.min(s.getLastColumn(), HEADER.length);
        var values = s.getRange(2, 1, rows, cols).getValues().map(function (r) {
          if (r[3] !== '' && r[3] !== null) r[3] = "'" + String(r[3]);   // giữ số 0 đầu của SĐT
          return r;
        });
        main.getRange(main.getLastRow() + 1, 1, rows, cols).setValues(values);
        moved += rows;
      }
      Logger.log('Đã gộp ' + Math.max(rows, 0) + ' đơn từ tab "' + s.getName() + '" rồi xoá tab này');
      ss.deleteSheet(s);
      removed++;
    });

    if (main.getLastRow() > 1) {
      main.getRange(2, 10, main.getLastRow() - 1, 3).setNumberFormat('#,##0"đ"');
    }
    props.setProperty('ORDER_SHEET_ID', String(main.getSheetId()));
    Logger.log('XONG: gộp ' + moved + ' đơn vào tab "' + main.getName() + '", xoá ' + removed + ' tab thừa.');
  } finally {
    lock.releaseLock();
  }
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
    items: 'Chè bưởi (Full size 250ml) x2, Sữa dâu (Mini size 100ml) x1', itemCount: 3,
    goods: 145000, total: 165000, note: 'Đây là đơn test, xoá đi được nhé'
  }) } });
}

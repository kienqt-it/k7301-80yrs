# K7301 Backend

Express + Turso (libSQL hosted) cho website đóng góp K7301. Dependency và scripts nằm chung ở
[package.json](../package.json) ở thư mục gốc — không có `package.json` riêng trong `server/`.

## Chạy local

```bash
# ở thư mục gốc của repo
npm install
cp .env.example .env   # rồi điền ADMIN_TOKEN, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
npm run server:dev
```

Server chạy ở `http://localhost:4000`. Cần có `TURSO_DATABASE_URL` (và `TURSO_AUTH_TOKEN` nếu dùng
database hosted thật) — xem [DEPLOY.md](../DEPLOY.md) để tạo database Turso. Để thử nhanh không cần
tài khoản Turso, có thể dùng file cục bộ: `TURSO_DATABASE_URL=file:./server/data/dev.db` (không cần
`TURSO_AUTH_TOKEN`).

## Luồng đóng góp

1. Người dùng điền form ở frontend → `POST /api/contributions` → server sinh mã đối chiếu (vd `K7301-7F3K9A`), lưu `status=pending`.
2. Mã này được nhúng vào nội dung chuyển khoản trên QR.
3. Ban liên lạc đối chiếu sao kê ngân hàng bằng mắt, dùng các lệnh admin dưới đây để xác nhận.
4. Trang chủ chỉ hiển thị/tính tổng các khoản `confirmed`.

## Lệnh admin mẫu (curl)

```bash
# Xem danh sách đang chờ xác nhận
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:4000/api/admin/contributions?status=pending

# Xác nhận một khoản (id lấy từ lệnh trên)
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:4000/api/admin/contributions/1/confirm

# Từ chối một khoản
curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"reason":"Không thấy giao dịch tương ứng"}' \
  http://localhost:4000/api/admin/contributions/1/reject

# Xuất CSV (mặc định toàn bộ, hoặc thêm ?status=confirmed)
curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:4000/api/admin/export.csv -o dong-gop.csv
```

## Kích hoạt xác nhận tự động qua webhook ngân hàng (tùy chọn, làm sau)

Endpoint `POST /api/webhooks/bank` đã viết sẵn logic đối chiếu (trích mã từ nội dung CK,
khớp với contribution `pending`, tự động confirm nếu đúng mã + đúng số tiền), nhưng
chưa được kết nối với dịch vụ thật. Để bật:

1. Đăng ký tài khoản tại [Casso.vn](https://casso.vn) hoặc [SePay.vn](https://sepay.vn).
2. Liên kết tài khoản VietinBank của trường (127000113108) với dịch vụ đó.
3. Đặt `WEBHOOK_SECRET` trong `.env` bằng một chuỗi bí mật ngẫu nhiên.
4. Trong cấu hình webhook của Casso/SePay, trỏ về `https://<domain-cua-ban>/api/webhooks/bank`,
   kèm header `X-Webhook-Secret: <giá trị bạn đặt ở bước 3>`, body dạng
   `{ "content": "...", "amount": 100000, "transactionId": "...", "transactionDate": "..." }`
   (tuỳ provider có thể cần viết thêm một adapter nhỏ để map đúng field tên của họ sang format này).

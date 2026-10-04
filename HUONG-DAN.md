# Hướng dẫn: Sổ tay thị trường

Website cá nhân để viết nhận định thị trường hàng tuần. Không cần cài phần mềm, không cần biết lập trình.

## 1. Mở thử trên máy

Giải nén thư mục, bấm đúp **index.html**. Bạn sẽ thấy một bài mẫu. Cần có Internet để tải phông chữ đẹp (không có mạng vẫn xem được, chỉ khác phông).

## 2. Đăng bài mỗi tuần (khoảng 5 bước)

1. Bấm đúp **soan-bai.html**.
2. Bấm **Bài mới**. Trang tự chọn tuần hiện tại và có sẵn các mục (Bối cảnh vĩ mô, Chứng khoán VN, Vàng bạc dầu, Bitcoin, Nông sản, Kịch bản tuần tới) cùng bảng giá cuối tuần.
3. Điền tiêu đề, sapo, giá, nhận định. Cột bên phải hiện bản xem trước ngay khi bạn gõ. Trang tự lưu nháp, tắt nhầm trình duyệt vẫn không mất.
4. Bấm **Lưu bài**.
5. Mở **index.html** để xem kết quả. Nếu website đã lên mạng, đưa lại thư mục lên (xem mục 4).

Cuối tuần: chọn bài ở ô **Sửa bài đã đăng**, điền mục **Đối chiếu và bài học**, bấm Lưu bài. Đây là phần quan trọng nhất cho việc học về sau.

### Lưu thẳng, đỡ thao tác (Chrome hoặc Edge trên máy tính)

Bấm **Nối với thư mục website**, chọn thư mục chứa index.html. Từ đó nút Lưu bài ghi thẳng vào `data/posts.js`.

Nếu nút này không dùng được trên máy bạn, vẫn lưu bình thường: Lưu bài sẽ tải về file `posts.js`, bạn chép đè vào thư mục `data`.

## 3. Đổi tên, màu, danh mục, mẫu bài

Mở **data/site.js** bằng Notepad. Chỉ sửa chữ trong dấu ngoặc kép:

- `name`: tên website
- `accent`: màu nhấn (có gợi ý ngay trong file)
- `categories`: danh mục để tick khi soạn bài
- `template`: các mục và dòng bảng giá có sẵn khi bấm Bài mới
- `about`: nội dung trang Giới thiệu

## 4. Đưa website lên mạng

| Cách | Ưu điểm | Nhược điểm |
|---|---|---|
| **Netlify Drop** (kéo thả thư mục lên trang netlify.com/drop) | Dễ nhất, không cần tài khoản kỹ thuật | Mỗi lần có bài mới phải kéo thả lại cả thư mục |
| **GitHub Pages** | Miễn phí, địa chỉ ổn định, lưu lịch sử bài | Phải làm quen GitHub, mỗi tuần tải file posts.js lên |

Các dịch vụ này có thể đổi giao diện hoặc điều khoản, bạn kiểm tra trang chủ của họ trước khi dùng.

Lưu ý:
- Khi đã lên mạng, **ai có link đều đọc được**. Nếu muốn riêng tư, đừng đăng lên hoặc dùng tính năng đặt mật khẩu của dịch vụ.
- Trang soan-bai.html chỉ dùng trên máy bạn, nó không thể sửa website trên mạng. Có thể xóa file này khỏi bản đưa lên mạng nếu muốn gọn.

## 5. Cách viết trong ô nội dung

- Dòng trống = sang đoạn mới
- Dòng bắt đầu bằng `- ` = gạch đầu dòng
- `**chữ đậm**`, `*chữ nghiêng*`
- `## Tiêu đề nhỏ` (viết riêng một dòng)
- `[chữ hiển thị](https://địa-chỉ)` = liên kết

## 6. Sao lưu

Toàn bộ bài viết nằm trong một file: **data/posts.js**. Chép file này ra chỗ khác (USB, Google Drive) mỗi tuần là đủ.

## 7. Cấu trúc thư mục

```
index.html        trang đọc bài
soan-bai.html     trang soạn bài
data/site.js      cài đặt chung (sửa được)
data/posts.js     toàn bộ bài viết (trang Soạn bài tự tạo)
assets/           giao diện và mã chạy (không cần sửa)
```

Bài đầu tiên (tuần 40) là bài thật. Các bài sau, bấm Bài mới ở trang Soạn bài để viết.

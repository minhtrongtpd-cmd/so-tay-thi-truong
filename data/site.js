/* Cài đặt chung của website. Đây là file DUY NHẤT bạn cần sửa tay (bằng Notepad cũng được).
   Chỉ sửa chữ nằm trong dấu ngoặc kép "...", đừng xóa dấu ngoặc kép, dấu phẩy. */
window.SITE = {
  // Tên hiển thị ở đầu trang
  name: "Sổ tay thị trường",

  // Tên của bạn (hiện ở trang Giới thiệu)
  author: "Bạch Mã",

  // Màu nhấn của trang (mã màu). Gợi ý: "#B4412B" đỏ gạch, "#1F5FA8" xanh, "#1E6B52" xanh lá, "#8A5A00" nâu vàng
  accent: "#B4412B",

  // Dòng chữ nhỏ ở cuối mỗi bài
  disclaimer: "Ghi chép cá nhân phục vụ học tập, không phải khuyến nghị đầu tư.",

  // Dòng chữ ở chân trang
  footerNote: "Dành cho mục đích học tập cá nhân",

  // Tên khối nổi bật trong bài (phần liên quan nghề của bạn)
  tacnLabel: "Góc ngành thức ăn chăn nuôi",

  // Các danh mục để tick chọn khi soạn bài (thêm bớt thoải mái)
  categories: ["Chứng khoán VN", "Vàng · Bạc", "Dầu", "Bitcoin", "Nông sản", "Ngoại hối"],

  // Mẫu bài mới: các mục có sẵn khi bấm "Bài mới" ở trang Soạn bài
  template: {
    sections: [
      "Bối cảnh vĩ mô",
      "Chứng khoán Việt Nam",
      "Vàng, bạc, dầu",
      "Bitcoin",
      "Nông sản: ngô, khô đậu tương, lúa mì",
      "Kịch bản tuần tới"
    ],
    // Các dòng có sẵn trong bảng giá cuối tuần
    assets: [
      "VN-Index",
      "Vàng",
      "Bạc",
      "Dầu WTI",
      "Bitcoin",
      "Ngô",
      "Khô đậu tương",
      "Lúa mì"
    ]
  },

  // Nội dung trang Giới thiệu (dòng trống = đoạn mới)
  about:
    "Đây là sổ tay cá nhân để mình viết nhận định thị trường hàng tuần: chứng khoán Việt Nam, vàng, bạc, dầu, Bitcoin và nông sản.\n\n" +
    "Mục đích chính là học tập: mỗi tuần ghi lại nhận định, cuối tuần đối chiếu với diễn biến thực tế và rút kinh nghiệm.\n\n" +
    "Nội dung chỉ là ghi chép cá nhân, không phải lời khuyên đầu tư."
};

export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || "Đã có lỗi xảy ra ở máy chủ" });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Không tìm thấy endpoint" });
}

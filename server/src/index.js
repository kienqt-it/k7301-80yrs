import app from "./app.js";

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`K7301 backend đang chạy tại http://localhost:${port}`);
});

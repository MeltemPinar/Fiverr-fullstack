import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/auth.route.js";
import gigRouter from "./routes/gig.route.js";
import reviewRouter from "./routes/review.route.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

// env dosyasındaki verilere erişmek için kurulum
dotenv.config();

// veritabanı ile bağlantı kur
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Veritabanı ile bağlantı kuruldu"))
  .catch((err) =>
    console.log("Veritabanı ile bağlantı kurulurken bir hataaa oluştu", err)
  );

// express uygulaması oluştur
const app = express();

//* middlewares
//a) bodydeki json içeriğinin okunmasını sağlar
app.use(express.json());

//b) kendi react uygulamamızdan gelen isteklere cevap vermesine izin ver
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//c) consola istekleri yazan middlware
app.use(morgan("dev"));

//d) çerezleri işler ve erişilebilir hale getirir
app.use(cookieParser());

//* route tanımlama
app.use("/api/auth", authRouter);
app.use("/api/gig", gigRouter);
app.use("/api/review", reviewRouter);

//* hata yönetimi
// controller lardan yapılcak tüm yönlendirmeler bu middleware i tetikler
app.use((err, req, res, next) => {
  console.log("HATA MEYDANA GELDİ");
  console.log(err);

  const errStatus = err.status || 500;
  const errMessage = err.message || "Üzgünüz bir şeyler ters gitti";

  return res.status(errStatus).json({
    statusCode: errStatus,
    message: errMessage,
  });
});

// hangi portun dinleneceğini belirle
app.listen(process.env.PORT, () => {
  console.log(`API ${process.env.PORT} portu dinlemeye başladı`);
});

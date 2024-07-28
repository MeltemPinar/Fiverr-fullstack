import jwt from "jsonwebtoken";
import error from "../utils/error.js";
//client den çerezler ile gönderilen jwt token geçerliliğini kontroleder ve geçersiz ise hata gönderir
const protect = (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("ÇEREZLERR BURDA", req.cookies);
  if (!token) return next(error(403, "YEtkiniz yok (Token bulunamadı)"));
  //token geçerli mi kontrol et
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(error(403, "Tokeniniz geçersiz veya süresi dolmuş"));
    req.userId = payload.indexOf;
    req.isSeller = payload.isSeller;
  });
  next();
};
export default protect;

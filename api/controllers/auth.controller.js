import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import error from "../utils/error.js";
//kaydol: yeni hesap oluşturma
export const register = async (req, res, next) => {
  try {
    // şifreyi hashle ve saltla
    const hashedPass = bcrypt.hashSync(req.body.password, 5);
    // veritbanına kaydedilecek kullanıcyıı oluştur
    const newUser = new User({ ...req.body, password: hashedPass });
    //  veritbanına kaydet
    await newUser.save();
    // clienta cevap gönder
    res.status(201).json({
      message: "Yeni kullanıcı oluşturuldu",
      user: newUser,
    });
  } catch (err) {
    // hata middlwarine yönlendirdik ve yönlendirirken hata açıklamasını gönderdik
    console.log("NEEEEEEEEEE", err);
    next(error(400, "Hesap oluşrurulurken bir hata oluştu"));
  }
};
//giriş yap: varolan hesaba
export const login = async (req, res, next) => {
  try {
    //ismine göre kullanıcıyı bul
    const user = await User.findOne({
      username: req.body.username,
    });
    //kullanıcı bulunamazsa hata gönder
    if (!user) return next(error(404, "Kullanıcı bulunamadı"));
    //kullanıcı bulunursa şifresi doğrumu kontrol et (veritabanındaki hashlenmiş şifre ile isteğin body sine gelen normal şifreyi karşılaştır)
    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    //şifre yanlışsa hata gönder
    if (!isCorrect) return next(error(404, "Şifreniz hatalı"));
    //şifre doğruysa jwt token oluştur
    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY
    );
    //şifre alanını kaldır
    user.password = null;
    //tokeni çerezler ile cliente gönder
    res.cookie("accessToken", token).status(200).json({
      message: "Hesaba giriş yapıldı",
      user,
    });
  } catch (err) {
    console.log("NEEEEEEEEEE", err);
    next(error(400, "Giriş yaparken bir sorun oluştu"));
  }
};
//çıkış yap: oturumu kapat
//kullanıcıya giriş yaparken gönderdiğimiz token geçerliliğini sonlandır
export const logout = async (req, res, next) => {
  res.clearCookie("accessToken").status(200).json({
    message: "Kullanıcı hesabından çıkış yaptı",
  });
};

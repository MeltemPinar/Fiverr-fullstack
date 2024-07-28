import error from "../utils/error.js";
import Review from "../models/review.model.js";
import Gig from "../models/gig.model.js";
export const createReview = async (req, res, next) => {
  //1)kullanıcı satıcı ise işlemi iptal et
  if (req.isSeller) return next(error(403, "Satıcılar yorum gönderemez"));
  //2)yorum belgesi oluştur
  const newReview = new Review({
    user: req.userId,
    gigId: req.body.gigId,
    desc: req.body.desc,
    star: req.body.star,
  });
  try {
    //3)kullanıcının daha önce bu hizmete yaptığı yorumu al
    const oldrev = await Review.findOne({
      user: req.userId,
      gigId: req.body.gigId,
    });
    //4)eski bir yorum varsa işlemi iptal et
    if (oldRev) return next(error(403, "Zaten bu hizmete yorum yaptınız"));
    //5)yorumu kaydet
    await newReview.save();
    //6)hizmetin rating değerini güncelle
    //toplam yıldız sayısını yeni atılan yorumun yıldızı kadar arttır
    //toplam yorum sayısını ise bir arttır
    await Gig.findByIdAndUpdate(req.body.gigId, {
      $inc: { starcount: req.body.star, reviewCount: 1 },
    });
    res.status(201).json({
      message: "Yorum gönderildi",
      data: newReview,
    });
  } catch (err) {
    console.log(err);
    next(error(500, "Yorum gönderilirken bir sorun oluştu"));
  }
};
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId }).populate(
      "user"
    );
    res.status(200).json({ reviews });
  } catch (err) {
    next(error(500, "Yorumlar alınırken bir hata oluştu"));
  }
};
export const deleteReview = async (req, res, next) => {
  try {
    //1) yorumun detaylarını al
    const review = await Review.findById(req.params._id);
    console.log("REVİEWWWW", review);
    //2) yorumu oluşturan ve silmek isteyen kullanıcı aynı mı kontrol et
    if (review.user != req.userId)
      return next(
        error(403, "Sadece kendi oluşturduğunuz hizmeti silebilirsiniz")
      );
    //3)yorumu sil
    await Review.findByIDAndDelete(req.params._id);
    //4)client e cevap gönder
    res.status(200).json({ message: "Yorum başarıyla silindi" });
  } catch (err) {
    console.log("HAAATAAAA", err);
    next(error(500, "Yorum silinirken bir hata oluştur"));
  }
};

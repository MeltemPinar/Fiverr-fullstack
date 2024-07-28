import error from "../utils/error.js";
import Gig from "../models/gig.model.js";

//filtreleme ayarlarını oluşturan method
const buildFilters = (query) => {
  //filtreleme ayarlarınınn tanımlandığı nesne oluştur
  const filters = {};
  if (query.userId) {
    filters.user = query.userId;
  }
  if (query.cat) {
    filters.category = query.cat;
  }
  if (query.min || query.max) {
    filters.price = {};
    if (query.min) {
      filters.price.$gt = query.min;
    }
    if (query.max) {
      filters.price.$lt = query.max;
    }
  }
  if (query.search) {
    filters.title = { $regex: query.search, $options: "i" };
  }
  if (query.userId) {
    filters.user = query.userId;
  }
  //fonksiyonun çağrıldığı yere ayarları döndür
  return filters;
};
//1) bütün hizmetleri al
export const getAllGigs = async (req, res, next) => {
  //filtreleme ayarlarını oluşturan fonk çağır
  const filters = buildFilters(req.query);
  try {
    const gigs = await Gig.find(filters).populate("user");
    if (gigs.length > 0) {
      res.status(200).json({
        message: "Hizmetler alındı",
        gigs,
      });
    } else {
      next(error(404, "Aratılan kriterlere uygun bir hizmet bulunamadı"));
    }
  } catch (err) {
    next(error(500, "Hizmetler alınırken bir hata oluştu"));
  }
};
//2)bir hizmeti al
export const getGig = async (req, res, next) => {
  try {
    //url ye param olarak eklenen id den hizmetin bilgilerine eriş
    const gig = await Gig.findById(req.params.id).populate("user");
    res.status(200).json({
      message: "Hizmet bulundu",
      gig: gig,
    });
  } catch (err) {
    //gönderilen id de hizmet yoksa hata gönder
    next(error(404, "Bu id ye ait hizmet bulunamadı"));
  }
};
//3)yeni hizmet oluştur
export const createGig = async (req, res, next) => {
  //kullanıcı satıcı değilse hata gönder
  if (!req.isSeller)
    return next(error(403, "Sadece satıcılar hizmet oluşturabilir"));
  //yeni hizmet oluştur
  const newGig = new Gig({
    user: req.userId,
    ...req.body,
  });
  try {
    const savedGig = await newGig.save();
    //client ecevap gönder
    res.status(200).json({
      message: "Hizmeet başarıyla oluşturuldu",
      gig: savedGig,
    });
  } catch (err) {
    console.log("ERRRROORR", err);
    next(error(500, "Hizmet oluşturulurken bir hata oluştu"));
  }
};
//4) bir hizmeti sil
export const deleteGig = async (req, res, next) => {
  try {
    //1) hizmetin detaylarını al
    const gig = await Gig.findById(req.params.id);
    //2) hizmeti oluşturan ve silmek isteyen kullanıcı aynı mı kontrol et
    if (gig.user != req.userId)
      return next(
        error(403, "Sadece kendi oluşturduğunuz hizmeti silebilirsiniz")
      );
    //3)hizmeti sil
    await Gig.findByIDAndDelete(req.params.id);
    //4)client e cevap gönder
    res.status(200).json({ message: "Hizmet başarıyla silindi" });
  } catch (err) {
    console.log(err.message);
    return next(error(500, "Hizmet silinirken bir hata oluştu"));
  }
};

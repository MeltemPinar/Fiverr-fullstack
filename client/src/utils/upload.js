import axios from "axios";

import { toast } from "react-toastify";
const upload = async (file) => {
  //resim değilse hata gönder
  if (!file.type.startsWith("image")) return null;
  //resim bir formdata içerisine ekle
  const data = new FormData();
  data.append("file", file);
  //yükleme ayarlarını belirle
  data.append("upload_preset", "profile");
  try {
    //api isteği atıp resmi buluta yükle
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dvaekgjfv/image/upload",
      data
    );
    //resim url sini fonksiyonun çağrıldığı yere döndür
    return res.data.url;
  } catch (err) {
    toast.error("fotoğraf yüklenirken bir hata oluştu");
  }
};
export default upload;

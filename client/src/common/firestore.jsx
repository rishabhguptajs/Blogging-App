import axios from "axios";

export const uploadImage = async(file) => {
  const res = await axios({
    method: "POST",
    url: import.meta.env.VITE_SERVER_URL + "/get-upload-url",
    data: file,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res;
}
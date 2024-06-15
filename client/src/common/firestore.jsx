
export const uploadImage = (data) = await axios({
    method: "POST",
    url: import.meta.env.VITE_SERVER_URL + "/get-upload-url",
    data: data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
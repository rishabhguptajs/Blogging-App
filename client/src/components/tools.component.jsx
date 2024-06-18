import Embed from "@editorjs/embed"
import List from "@editorjs/list"
import Image from "@editorjs/image"
import Header from "@editorjs/header"
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code"
import { uploadImage } from "../common/firestore"

const uploadImagebyFile = async (file) => {
  try {
    const res = await uploadImage(file);
    return {
      success: 1,
      file: { url: res.uploadURL }, 
    };
  } catch (error) {
    console.error("Image upload failed", error);
    return {
      success: 0,
      message: error.message,
    };
  }
};

const uploadImageByURL = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e)
    } catch (error) {
      reject(error)
    }
  })

  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    }
  })
}

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Heading",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
}

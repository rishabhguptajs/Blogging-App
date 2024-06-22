import { Link, useNavigate } from "react-router-dom"
import logo from "../imgs/logo.png"
import AnimationWrapper from "../common/page-animation"
import defaultBanner from "../imgs/blog banner.png"
import axios from "axios"
import { useContext, useEffect, useRef } from "react"
import { Toaster, toast } from "react-hot-toast"
import { EditorContext } from "../pages/editor.pages"
import EditorJS from "@editorjs/editorjs"
import { tools } from "./tools.component"
import { uploadImage } from "../common/firestore"
import { UserContext } from "../App"

const BlogEditor = () => {
  let blogBannerRef = useRef()
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext)

  let {
    userAuth: { access_token },
  } = useContext(UserContext)

  let navigate = useNavigate()

  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: content,
        tools: tools,
        placeholder: "Start writing now!",
      })
    )
  }, [])

  const handleBannerUpload = async (e) => {
    let img = e.target.files[0]

    if (img) {
      let loadingToast = toast.loading("Uploading banner...")

      const data = new FormData()
      data.set("file", img)

      try {
        const res = await uploadImage(data)

        const url = res.data.uploadURL

        blogBannerRef.current.src = url

        toast.dismiss(loadingToast)
        toast.success("Banner uploaded successfully")

        setBlog({ ...blog, banner: url })
      } catch (error) {
        toast.dismiss(loadingToast)

        toast.error("Failed to upload banner")
      }
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault()
    }
  }

  const handleTitleChange = (e) => {
    let input = e.target

    input.style.height = "auto"
    input.style.height = input.scrollHeight + "px"

    setBlog({ ...blog, title: input.value })
  }

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Please upload a banner to publish the blog.")
    }

    if (!title.length) {
      return toast.error("Write a title for the blog first.")
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data })
            setEditorState("publish")
          } else {
            toast.error("Write some content to publish the blog.")
          }
        })
        .catch((err) => {
          console.error(err)
          toast.error("Failed to save blog content. Please try again.")
        })
    }
  }

  const handleKeyDownFunction = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault()

      let tag = e.target.value.trim()

      if (tag && tags.length < tagLimit) {
        if (!tags.includes(tag)) {
          setBlog({ ...blog, tags: [...tags, tag] })
          setTagInput("")
        } else {
          toast.error("Tag already exists")
        }
      } else if (!tag) {
        toast.error("Tag cannot be empty")
      } else {
        toast.error("Tag limit reached")
      }
    }
  }

  const handleSaveDraft = (e) => {
    if (e.target.classList.contains("disable")) {
      return
    }

    if (!title.length) {
      return toast.error("Write blog title for saving as a draft!")
    }

    let loadingToast = toast.loading("Saving draft...")

    e.target.classList.add("disable")

    if (textEditor.isReady) {
      textEditor.save().then(content => {
        let blogObject = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        }

        axios
          .post(import.meta.env.VITE_SERVER_URL + "/create-blog", blogObject, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then(() => {
            e.target.classList.remove("disable")
            toast.dismiss(loadingToast)
            toast.success("Saved ✒️")

            setTimeout(() => {
              navigate("/")
            }, 500)
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable")
            toast.dismiss(loadingToast)

            return toast.error(response.data.error)
          })
      })
    }
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner.length ? banner : defaultBanner}
                  className="z-20"
                  ref={blogBannerRef}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  )
}

export default BlogEditor

import { Toaster, toast } from "react-hot-toast"
import AnimationWrapper from "../common/page-animation"
import { useContext } from "react"
import { EditorContext } from "../pages/editor.pages"

const PublishForm = () => {

    const characterLimit = 150;
    let { blog, blog: { banner, title, tags, des }, setEditorState, setBlog } = useContext(EditorContext);

    const handleCloseEvent = () => {
        setEditorState("editor")
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, title: input.value })
    }

    const handleBlogDescriptionChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, des: input.value })
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">
                        Preview
                    </p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{ title }</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
                        { des }
                    </p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-0">
                    <p className="text-dark-grey mb-2 mt-9">Title</p>
                    <input className="input-box pl-4" type="text" placeholder="Blog Title" defaultValue={title} onChange={handleBlogTitleChange}/>

                    <p className="text-dark-grey mb-2 mt-9">Write a short description about your blog.</p>
                    <textarea 
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDescriptionChange}
                    >
                    </textarea>

                    <p>{ 
                        characterLimit - des.length
                    } characters left</p>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default PublishForm
import { useEffect, useState } from "react"
import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component"
import Loader from "../components/loader.component"
import axios from 'axios'
import BlogPostCard from "../components/blog-post.component"

const HomePage = () => {

    let [blogs, setBlogs] = useState(null);

    const fetchLatestBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_URL + "/latest-blogs")
        .then(({ data }) => {
            setBlogs(data.blogs)
        })
        .catch(error => {
            console.log(error)
        })
    }

    useEffect(() => {
        fetchLatestBlogs();
    }, [])

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}>
                        <>
                            {
                                blogs == null ? <Loader /> : 
                                blogs.map((blog, index) => {
                                    return <AnimationWrapper transition={{ duration: 1, delay: index*0.1 }} key={index}>
                                        <BlogPostCard content={blog} author={blog.author.personal_info} />    
                                    </AnimationWrapper>
                                })
                            }
                        </>

                        <h1>Trending</h1>
                    </InPageNavigation>
                </div>

                {/* filters and trending blogs */}
                <div>

                </div>
            </section>
        </AnimationWrapper>
    )
}

export default HomePage
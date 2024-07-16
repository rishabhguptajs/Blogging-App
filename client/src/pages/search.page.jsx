import { useParams } from "react-router-dom"
import InPageNavigation from "../components/inpage-navigation.component"
import { useEffect, useState } from "react"
import BlogPostCard from "../components/blog-post.component"
import AnimationWrapper from "../common/page-animation"
import NoDataMessage from "../components/nodata.component"
import LoadeMoreDataBtn from "../components/load-more.component"
import Loader from "../components/loader.component"
import axios from "axios"
import { filterPaginationData } from "../common/filter-pagination-data"

const SearchPage = () => {
  let { query } = useParams()

  let [ blogs, setBlogs ] = useState(null);

  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { query, page })
    .then(async({ data }) => {

        console.log(data.blogs)

        let formattedData = await filterPaginationData({
            state: blogs,
            data: data.blogs,
            page,
            countRoute: "/search-blogs-count",
            data_to_send: { query },
            create_new_arr
        })

        console.log(formattedData)
        setBlogs(formattedData)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {

    resetState();
    searchBlogs({ page: 1, create_new_arr: true });

  }, [query])

  const resetState = () => {
    setBlogs(null);
  }

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results for "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results && blogs.results.length ? (
              blogs.results.map((blog, index) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: index * 0.1 }}
                    key={index}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                )
              })
            ) : (
              <NoDataMessage message={"No Blogs Published!"} />
            )}

            <LoadeMoreDataBtn state={blogs} fetchDataFn={searchBlogs} />
          </>
        </InPageNavigation>
      </div>
    </section>
  )
}

export default SearchPage

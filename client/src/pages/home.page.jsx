import { useEffect, useState } from "react"
import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component"
import Loader from "../components/loader.component"
import axios from "axios"
import BlogPostCard from "../components/blog-post.component"
import MinimalBlogPost from "../components/nobanner-blog-post.component"
import { activeTab } from "../components/inpage-navigation.component"
import NoDataMessage from "../components/nodata.component"
import { filterPaginationData } from "../common/filter-pagination-data"
import LoadeMoreDataBtn from "../components/load-more.component"

const HomePage = () => {
  let [blogs, setBlogs] = useState(null)
  let [trendingBlogs, setTrendingBlogs] = useState()
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programming",
    "movies",
    "film making",
    "politics",
    "finance",
    "tech",
    "travel",
  ]

  const fetchLatestBlogs = ({page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/latest-blogs", { page })
      .then(async({ data }) => {

        console.log(data.blogs)

        let formattedData = await filterPaginationData({
            state: blogs,
            data: data.blogs,
            page,
            countRoute: "/all-latest-blogs-count"
        })

        console.log(formattedData)
        setBlogs(formattedData)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { tag: pageState, page })
      .then( async({ data }) => {

        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState }
      })

        setBlogs(formattedData)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    
    setBlogs(null);

    if(pageState == category){
        setPageState("home");
        return;
    }

    setPageState(category);
  }

  useEffect(() => {

    activeTab.current.click();

    if(pageState == "home"){
        fetchLatestBlogs({ page: 1 });
    } else {
        fetchBlogsByCategory({ page: 1 });
    }

    if(!trendingBlogs){
        fetchTrendingBlogs()
    }

  }, [pageState]);


  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : (
                blogs.results && blogs.results.length ? blogs.results.map((blog, index) => {
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
                  }) : <NoDataMessage message={"No Blogs Published!"} />
              )}
              <LoadeMoreDataBtn state={blogs} fetchDataFn={( pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory )} />
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : (
                trendingBlogs.length ? trendingBlogs.map((blog, index) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: index * 0.1 }}
                        key={index}
                      >
                        <MinimalBlogPost blog={blog} index={index} />
                      </AnimationWrapper>
                    )
                  }) : <NoDataMessage message={"No trending blogs!"} />
              
            )}
          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">Stories</h1>

              <div className="flex flex-wrap gap-3">
                {categories.map((category, i) => {
                  return (
                    <button onClick={loadBlogByCategory} key={i} className={"tag" + (pageState == category ? " bg-black text-white " : "")}>
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>

              {trendingBlogs == null ? (
                <Loader />
              ) : (
                trendingBlogs.length ? trendingBlogs.map((blog, index) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: index * 0.1 }}
                        key={index}
                      >
                        <MinimalBlogPost blog={blog} index={index} />
                      </AnimationWrapper>
                    )
                  }) : <NoDataMessage message={"No trending blogs!"} />
                
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  )
}

export default HomePage

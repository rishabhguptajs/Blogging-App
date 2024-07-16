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
import UserCard from "../components/usercard.component"

const SearchPage = () => {
  let { query } = useParams()

  let [ blogs, setBlogs ] = useState(null);
  let [ users, setUsers ] = useState(null);

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

  const fetchUsers = () => {
    axios.post(import.meta.env.VITE_SERVER_URL + "/search-users", { query })
    .then(({ data }) => {
      setUsers(data.users)
    })
  }

  useEffect(() => {

    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();

  }, [query])

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  }

  const UserCardWrapper = () => {
    return (
        <>
            {
                users == null ? <Loader /> : users.length ? (
                    users.map((user, index) => {
                        return (
                            <AnimationWrapper key={index} transition={{ duration: 1, delay: index * 0.08 }}>
                                <UserCard user={user} />
                            </AnimationWrapper>
                        )
                    })
                ) : (
                    <NoDataMessage message={"No Users Found!"} />
                )
            }
        </>
    )
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
          
          <UserCardWrapper />
        </ InPageNavigation>
      </div>

      <div className="min-w-[40% lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
            <h1 className="font-medium text-xl mb-8">
                Users Matching "{query}" &nbsp;
                <i className="fi fi-rr-user"></i>
            </h1>

            <UserCardWrapper />

      </div>
    </section>
  )
}

export default SearchPage

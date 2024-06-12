import React, { useContext, useState } from "react"
import InputBox from "../components/input.component"
import googleIcon from "../imgs/google.png"
import { Link, Navigate } from "react-router-dom"
import AnimationWrapper from "../common/page-animation"
import { Toaster, toast } from "react-hot-toast"
import axios from "axios"
import { storeInSession } from "../common/session"
import { UserContext } from "../App"
import { authWithGoogle } from "../common/firebase"

const UserAuthForm = ({ type }) => {
  const [authForm, setAuthForm] = useState(null)
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext)

  console.log(access_token)

  const useAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data.user))
        setUserAuth(data.user)
        console.log(sessionStorage)
      })
      .catch(({ response }) => {
        toast.error(response.data.message)
      })

    authForm.reset()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let serverRoute = type === "sign-in" ? "/login" : "/signup"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

    console.log(type)

    const formData = new FormData(e.target)

    const fullname = formData.get("fullname")
    const email = formData.get("email")
    const password = formData.get("password")

    if (type !== "sign-in" && !fullname) {
      return toast.error("Fullname is required")
    }

    if (!email.length) {
      return toast.error("Email is required")
    }

    if (!emailRegex.test(email)) {
      return toast.error("Invalid email")
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"
      )
    }

    useAuthThroughServer(serverRoute, formData)
  }

  const handleGoogleAuth = async(e) => {
    e.preventDefault()

    authWithGoogle().then(user => {
      let serverRoute = "/google-auth"

      const formData = new FormData()
      formData.append("access_token", user.accessToken)

      useAuthThroughServer(serverRoute, formData)
    })
  }

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form
          ref={(node) => setAuthForm(node)}
          onSubmit={handleSubmit}
          className="w-[80%] max-w-[400px]"
        >
          <h1 className="text-4xl font-gelasio capitalize text-center">
            {type === "sign-in" ? "Welcome back!" : "Join us today!"}
          </h1>

          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-sr-at"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button className="btn-dark center mt-14" type="submit">
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button 
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} alt="" className="w-5" />
            Continue with Google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today!
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  )
}

export default UserAuthForm

import React, { useRef, useState } from "react"
import InputBox from "../components/input.component"
import googleIcon from "../imgs/google.png"
import { Link } from "react-router-dom"
import AnimationWrapper from "../common/page-animation"

const UserAuthForm = ({ type }) => {
  const [authForm, setAuthForm] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

    console.log(type)

    const formData = new FormData(e.target)

    const fullname = formData.get("fullname")
    const email = formData.get("email")
    const password = formData.get("password")

    if (type !== "sign-in" && !fullname.length) {
      return console.log({ message: "Fullname is required" })
    }

    if (fullname) {
      if (!fullname.length) {
        return console.log({ message: "Fullname is required" })
      }
    }

    if (!email.length) {
      return console.log({ message: "Email is required" })
    }

    if (!emailRegex.test(email)) {
      return console.log({ message: "Invalid email" })
    }

    if (!passwordRegex.test(password)) {
      return console.log({
        message:
          "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters",
      })
    }
  }

  return (
    <div>
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex items-center justify-center">
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

            <button className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
              <img src={googleIcon} alt="" className="w-5" />
              Continue with Google
            </button>

            {type == "sign-in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don't have an account?
                <Link
                  to="/signup"
                  className="underline text-black text-xl ml-1"
                >
                  Join us today!
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Already a member?
                <Link
                  to="/signin"
                  className="underline text-black text-xl ml-1"
                >
                  Sign in
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </div>
  )
}

export default UserAuthForm

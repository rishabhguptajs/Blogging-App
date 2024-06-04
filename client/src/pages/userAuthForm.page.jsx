import React, { useRef } from "react"
import InputBox from "../components/input.component"
import googleIcon from "../imgs/google.png"
import { Link } from "react-router-dom"
import AnimationWrapper from "../common/page-animation"

const UserAuthForm = ({ type }) => {
  const authForm = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()

    let form = new FormData(authForm.current)
    let formData = {}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    for (let [key, value] of form.entries()) {
      formData[key] = value
    }

    let { fullname, email, password } = formData;

    if(fullname){
      if (fullname.length < 3) {
        return console.log({ message: "Fullname must be at least 3 characters" });
      } 
    }

    if(!email.length) {
      return console.log({ message: "Email is required" });
    }
      
    if(!password.length) {
      return console.log({ message: "Password is required" });
    }

    if (!emailRegex.test(email)) {
      return console.log({ message: "Invalid email" });
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
          <form ref={authForm} className="w-[80%] max-w-[400px]">
            <h1 className="text-4xl font-gelasio capitalize text-center">
              {type === "sign-in" ? "Welcome back!" : "Join us today!"}
            </h1>

            { type != "sign-in" ?
              <InputBox
                name="fullname"
                type="text"
                placeholder="Full Name"
                icon="fi-rr-user"
              />
            : ""}
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

            <button
              className="btn-dark center mt-14"
              type="submit"
              onClick={handleSubmit}
            >
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

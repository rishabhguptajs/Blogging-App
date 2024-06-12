import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAOGD67OFVBCtpHAIyjGDKeFI7YEj21VL8",
  authDomain: "blog-app-9ffa1.firebaseapp.com",
  projectId: "blog-app-9ffa1",
  storageBucket: "blog-app-9ffa1.appspot.com",
  messagingSenderId: "1226865132",
  appId: "1:1226865132:web:2e7bc7453032f0606928c9",
  measurementId: "G-8PGRJJ3YPQ",
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

const provider = new GoogleAuthProvider()

const auth = getAuth()

export const authWithGoogle = async () => {
  let user = null

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user
    })
    .catch((error) => {
      console.log(error)
    })

  return user
}

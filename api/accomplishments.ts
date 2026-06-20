// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCKrK4cvKjJR5KXo2bSQEHdskZHRvujXqI",
//   authDomain: "creative-power-hour.firebaseapp.com",
//   projectId: "creative-power-hour",
//   storageBucket: "creative-power-hour.firebasestorage.app",
//   messagingSenderId: "34755791244",
//   appId: "1:34755791244:web:3bb05a4f816bc6f9ce6ea9",
//   measurementId: "G-3NNYWH2X24"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export async function GET(request: Request) {
  return new Response('Hello from Vercel!');
}

export async function POST(request: Request) {
  return new Response('Posted a new accomplishment!');
}
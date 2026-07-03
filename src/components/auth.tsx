"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/app/supabase-client";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        console.log("Error signing up: ", signUpError.message);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if(signInError){
        console.log("Error signing in:", signInError.message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-[#1E1E1E] text-white rounded-lg border border-gray-800 shadow-xl mt-12 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-6 tracking-wide text-center">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="w-full mb-3 p-2 bg-[#2d2d2d] border border-gray-600 rounded text-center text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          className="w-full mb-5 p-2 bg-[#2d2d2d] border border-gray-600 rounded text-center text-sm placeholder-gray-500 focus:outline-none focus:border-gray-400"
        />

        <div className="flex gap-3 w-full justify-center">
          <button
            type="submit"
            className="py-1.5 px-4 bg-[#2d2d2d] border border-gray-600 rounded text-sm hover:bg-[#3d3d3d] transition duration-200"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="py-1.5 px-4 bg-transparent text-gray-400 text-sm hover:text-white transition duration-200"
          >
            {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}

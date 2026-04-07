import { useState } from "react";
import { loginUser } from "../services/auth.js";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const InputField = ({ label, type = "text", placeholder, value, onChange }) => (
   <div className="group flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase text-zinc-500 group-focus-within:text-[#ff6c98] transition-colors duration-200">
         {label}
      </label>
      <input
         type={type}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         className="bg-transparent border-b border-zinc-800 focus:border-[#ff6c98] py-2 text-sm text-zinc-100 placeholder-zinc-700 outline-none transition-colors duration-200 font-light"
      />
   </div>
);

const ErrorBanner = ({ message }) =>
   message ? (
      <div className="flex gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2.5 mb-4 items-center">
         <span className="text-red-400 font-bold text-xs leading-none mt-0.3">✕</span>
         <p className="text-red-400 text-xs font-medium leading-relaxed">{message}</p>
      </div>
   ) : null;

const Login = () => {
   const { setUser } = useAuth();
   const navigate = useNavigate();

   const [form, setForm] = useState({
      username: "",
      password: ""
   });
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         const res = await loginUser(form);
         setUser(res.data);
         navigate('/chat');


      } catch (err) {
         setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="h-dvh bg-[url(/assets/doodle.jpg)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 overflow-hidden overscroll-none">
         <div className="fixed inset-0 bg-black/80"></div>

         <div className="relative w-full max-w-sm bg-[#000000] border rounded-tl-2xl rounded-br-2xl border-zinc-800 px-8 py-8">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#ff155b] to-transparent" />

            <p className="text-xs tracking-widest uppercase text-[#6c93ff] font-medium mb-1">
               Welcome Back
            </p>
            <h1 className="text-4xl font-black text-zinc-100 leading-tight mb-6">
               Sign <span className="text-[#6c93ff]">In.</span>
            </h1>

            <ErrorBanner message={error} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <InputField
                  label="Username"
                  placeholder="@janedoe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
               />
               <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
               />

               <button
                  type="submit"
                  disabled={loading || !form.username || !form.password}
                  className="w-full rounded-tl-xl rounded-br-xl bg-[#00ff7b] hover:cursor-pointer hover:bg-[#00d266] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-900 text-xs font-bold tracking-widest uppercase py-3 transition-all duration-150 mt-1"
               >
                  {loading ? "Signing in..." : "Sign In"}
               </button>
            </form>

            <p className="text-center text-xs text-zinc-600 mt-4">
               Don't have an account?{" "}
               <Link to="/register" className="text-[#6c93ff] hover:underline font-medium">
                  Sign Up
               </Link>
            </p>
         </div>
      </div>
   );
};

export default Login;
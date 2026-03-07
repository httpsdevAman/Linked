import { useState } from "react";
import { registerUser } from "../services/auth.js";
import { Link } from "react-router-dom";

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

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerUser(form); 
      console.log(res.data);
      window.location.href = "/chat";
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh bg-[url(assets/doodle.jpg)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 overflow-hidden overscroll-none">
      <div className="fixed inset-0 bg-black/80"></div>

      <div className="relative w-full max-w-sm bg-[#050505] border rounded-tl-2xl rounded-br-2xl border-zinc-800 px-8 py-8">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#ff155b] to-transparent" />

        <p className="text-xs tracking-widest uppercase text-[#6c93ff] font-medium mb-1">
          Welcome
        </p>
        <h1 className="text-4xl font-black text-zinc-100 leading-tight mb-6">
          Create your <span className="text-[#6c93ff]">Account.</span>
        </h1>

      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputField
          label="Full Name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <InputField
          label="Username"
          placeholder="@janedoe"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <InputField
          label="Email Address"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          disabled={loading || !form.name || !form.username || !form.email || !form.password}
          className="w-full rounded-tl-xl rounded-br-xl bg-[#00ff7b] hover:bg-[#00d266] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 text-xs font-bold tracking-widest uppercase py-3 transition-all duration-150 mt-1"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-600 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-[#6c93ff] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
        </div >
    );
};

export default Register;
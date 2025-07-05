import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../utils/auth/authSlice";
import { apiConnector } from "../services/apiConnector";
import { AUTH_API } from "../services/apis";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiConnector("post", AUTH_API.LOGIN, form, {
        withCredentials: true,
      });

      dispatch(setUser({ ...res.user, token: res.token }));
      localStorage.setItem("token", res.token);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message || "Login failed";
      toast.error(msg);

      if (msg.toLowerCase().includes("invalid")) {
        toast("New here? Register instead.", { icon: "🔑" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        {/* App Logo / Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-wide">
            Document Signature
          </h1>
          <p className="text-sm text-gray-500 mt-1">Secure | Simple | Smart</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-sm text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm text-gray-700 block mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 pr-10 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

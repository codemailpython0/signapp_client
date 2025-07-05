import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiConnector } from "../services/apiConnector";
import { AUTH_API } from "../services/apis";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const otpUser = JSON.parse(localStorage.getItem("otpUser"));

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otpUser) {
      toast.error("No registration data found.");
      return navigate("/register");
    }

    try {
      await apiConnector(
        "post",
        AUTH_API.VERIFY_OTP,
        { email: otpUser.email, otp },
        { withCredentials: true }
      );

      localStorage.removeItem("otpUser");
      toast.success("OTP verified! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Document Signature
      </h1>

      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          OTP Verification
        </h2>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp" className="text-sm text-gray-700 block mb-1">
              Enter the OTP sent to your email
            </label>
            <input
              type="text"
              id="otp"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="6-digit OTP"
              className="w-full px-4 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md font-medium transition"
          >
            Verify OTP
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Didn't receive the OTP? Please check your spam folder or{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            register again
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;

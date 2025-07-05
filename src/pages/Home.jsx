import { Link } from "react-router-dom";
import { FaFileSignature } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full space-y-6">
        <div className="flex flex-col items-center">
          <FaFileSignature className="text-5xl text-emerald-600 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome to Document Signature
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base max-w-md">
            Effortlessly sign, send, and track documents online. Your digital signature hub for modern workflows.
          </p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/login"
            className="px-6 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-md font-medium transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

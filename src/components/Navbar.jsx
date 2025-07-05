import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../utils/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center rounded-md mb-4">
      <h1
        className="text-xl font-semibold cursor-pointer text-indigo-700"
        onClick={() => navigate("/dashboard")}
      >
        Document Signature App
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <FaUser />
          <span>{user?.name || "User"}</span>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded text-gray-700 border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { useState } from "react";
import { DOCUMENT_API } from "../services/apis";
import { apiConnector } from "../services/apiConnector";
import toast from "react-hot-toast";
import { FaUpload } from "react-icons/fa";

const UploadPDF = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a PDF file");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setUploading(true);
      await apiConnector("post", DOCUMENT_API.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("PDF uploaded successfully");
      setFile(null);
      onUploadSuccess(); // Refresh document list
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 bg-white p-4 rounded shadow flex flex-col sm:flex-row items-center gap-4 w-full">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="w-full sm:w-auto flex-1 border border-gray-300 rounded px-3 py-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <FaUpload />
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
};

export default UploadPDF;

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UploadPDF from "../components/UploadPDF";
import PDFEditor from "../components/PDFEditor";
import { apiConnector } from "../services/apiConnector";
import { DOCUMENT_API, PUBLIC_SIGNATURE_API } from "../services/apis";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import {
  FaTrashAlt,
  FaFileSignature,
  FaFilter,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [docToRequest, setDocToRequest] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await apiConnector("get", DOCUMENT_API.LIST, null, {
        withCredentials: true,
      });
      if (Array.isArray(res?.documents)) {
        setDocuments(res.documents);
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (err) {

      console.log(err);
      toast.error("Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter(
    (doc) => filterStatus === "All" || doc.status === filterStatus
  );

  const confirmDelete = (doc) => {
    setDocToDelete(doc);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await apiConnector("delete", DOCUMENT_API.DELETE(docToDelete._id), null, {
        withCredentials: true,
      });
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((doc) => doc._id !== docToDelete._id));
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    } finally {
      setShowModal(false);
      setDocToDelete(null);
    }
  };

  const sendSignatureLink = async () => {
    try {
      setEmailLoading(true);
      await apiConnector("post", PUBLIC_SIGNATURE_API.REQUEST_LINK, {
        documentId: docToRequest._id,
        email,
      });
      toast.success("Signature request sent!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send request");
    } finally {
      setEmail("");
      setDocToRequest(null);
      setShowEmailModal(false);
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Your Uploaded PDFs</h2>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Signed">Signed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {!selectedDoc && <UploadPDF onUploadSuccess={fetchDocuments} />}

      {!selectedDoc ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-lg shadow p-4 transition transform hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-400/50 relative"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold truncate">{doc.filename}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    doc.status === "Signed"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div
                style={{ border: "1px solid rgba(0,0,0,0.2)", height: "400px" }}
              >
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer fileUrl={`${SERVER_BASE_URL}/${doc.filepath}`} />
                </Worker>
              </div>

              {/* Top right actions */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(doc);
                  }}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                >
                  <FaTrashAlt /> Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocToRequest(doc);
                    setShowEmailModal(true);
                  }}
                  className="text-xs px-2 py-1 bg-green-800 text-white rounded hover:bg-green-900 flex items-center gap-1"
                >
                  <FaFileSignature /> Request
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <PDFEditor document={selectedDoc} goBack={() => setSelectedDoc(null)} />
      )}

      {/* Confirm Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{docToDelete?.filename}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDocToDelete(null);
                }}
                className="px-4 py-2 rounded text-gray-700 border border-gray-300 hover:bg-gray-100 flex items-center gap-1"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Send Signature Request
            </h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Recipient's email"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded text-gray-700 border border-gray-300 hover:bg-gray-100 flex items-center gap-1"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={sendSignatureLink}
                className={`px-4 py-2 rounded text-white flex items-center gap-1 ${
                  emailLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={emailLoading}
              >
                <FaPaperPlane /> {emailLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

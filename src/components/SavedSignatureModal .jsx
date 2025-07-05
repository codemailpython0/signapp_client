import { useEffect, useState } from "react";
import { SIGNATURE_API } from "../services/apis";
import { apiConnector } from "../services/apiConnector";
import { toast } from "react-hot-toast";

const SavedSignatureModal = ({ onClose, onSelect }) => {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const res = await apiConnector("get", SIGNATURE_API.GET_SAVED_IMAGE, null, {
        withCredentials: true,
      });
      if (Array.isArray(res?.signatureImages)) {
        setSignatures(res.signatureImages);
      }
    } catch (err) {
        console.log(err);
      

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    try {
      await apiConnector("delete", SIGNATURE_API.DELETE_SAVED_IMAGE(index), null, {
        withCredentials: true,
      });
      toast.success("Signature deleted");
      setSignatures((prev) => prev.filter((_, idx) => idx !== index));
    } catch (err) {
      toast.error("Failed to delete signature");
    } finally {
      setConfirmDeleteIndex(null);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Choose a Signature</h2>
          <button onClick={onClose} className="text-red-500 font-bold">✖</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : signatures.length > 0 ? (
          <div className="grid gap-4">
            {signatures.map((sig, idx) => (
              <div
                key={idx}
                className="relative border p-2 rounded hover:ring"
              >
                <img
                  src={sig}
                  alt={`Signature ${idx + 1}`}
                  className="w-full cursor-pointer"
                  onClick={() => {
                    onSelect(sig);
                    onClose();
                  }}
                />
                <button
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteIndex(idx);
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No signatures found.</p>
        )}

        {confirmDeleteIndex !== null && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-60 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-4">Are you sure you want to delete this signature?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setConfirmDeleteIndex(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteIndex)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-gray-600 hover:underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedSignatureModal;

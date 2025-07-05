import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiConnector } from "../services/apiConnector";
import { toast } from "react-hot-toast";
import PDFEditor from "../components/PDFEditor";
import { PUBLIC_SIGNATURE_API } from "../services/apis";

const PublicSigner = () => {
  const { token } = useParams();
  const [document, setDocument] = useState(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await apiConnector("get", `public-signature/view/${token}`);
        setDocument(res.document);
      } catch (err) {
        console.log(err);
        toast.error("Invalid or expired link");
      }
    };
    fetchDocument();
  }, [token]);

  const handlePublicSignatureConfirm = async () => {
    try {
      await apiConnector("post", PUBLIC_SIGNATURE_API.CONFIRM_SIGNATURE(token));
      toast.success("Signature confirmed");
      setSigned(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to confirm signature");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-semibold mb-4 text-center">Sign Document</h1>

      {signed ? (
        <p className="text-center text-green-600 font-semibold text-lg">
          ✅ Document Signed Successfully!
        </p>
      ) : document ? (
        <PDFEditor
          document={document}
          isPublic
          onComplete={handlePublicSignatureConfirm}
        />
      ) : (
        <p className="text-center text-gray-500">Loading document...</p>
      )}
    </div>
  );
};

export default PublicSigner;

import { useEffect, useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Rnd } from "react-rnd";
import { apiConnector } from "../services/apiConnector";
import { toast } from "react-hot-toast";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { PDFDocument } from "pdf-lib";
import { SIGNATURE_API } from "../services/apis";
import SavedSignatureModal from "./SavedSignatureModal ";
import TextSignatureModal from "./TextSignatureModal";
import {
  FaDownload,
  FaSave,
  FaPenFancy,
  FaEye,
  FaSign,
  FaArrowLeft,
  FaUniversity,
  FaTimes,
  FaFont,
} from "react-icons/fa";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

const PDFEditor = ({ document: pdfDoc, goBack, isPublic = false, onComplete }) => {
  const [signatures, setSignatures] = useState([]);
  const [signMode, setSignMode] = useState(true);
  const [showPad, setShowPad] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef();
  const sigPadRef = useRef();

  const fetchSavedSignatureImage = async () => {
    try {
      const res = await apiConnector("get", SIGNATURE_API.GET_SAVED_IMAGE, null, {
        withCredentials: true,
      });
      if (res?.signatureImage) {
        setSignatureImage(res.signatureImage);
        toast.success("Loaded saved signature");
      }
    } catch (err) {
      console.log(err);
      console.warn("No saved signature found");
    }
  };

  const saveSignature = async () => {
    if (!sigPadRef.current.isEmpty()) {
      const dataUrl = sigPadRef.current.getCanvas().toDataURL("image/png");
      setSignatureImage(dataUrl);
      setShowPad(false);
      toast.success("Signature saved locally. Click to place it.");

      try {
        await apiConnector("post", SIGNATURE_API.SAVE_IMAGE, { image: dataUrl }, {
          withCredentials: true,
        });
        toast.success("Signature saved for future use");
      } catch {
        toast.error("Failed to save signature to server");
      }
    } else {
      toast.error("Please draw your signature first");
    }
  };

  const handlePlaceSignature = (e) => {
    if (!signMode || !signatureImage || signatures.length > 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 25;

    const newSig = {
      x,
      y,
      page: currentPage,
      image: signatureImage,
      width: 100,
      height: 50,
    };

    setSignatures([newSig]);
    toast.success(`Signature placed on page ${currentPage}`);
  };

  const handleSaveToServer = async () => {
    try {
      for (const sig of signatures) {
        await apiConnector("post", "signatures", {
          documentId: pdfDoc._id,
          x: sig.x,
          y: sig.y,
          page: sig.page,
          signStatus: "signed",
        }, {
          withCredentials: true,
        });
      }
      toast.success("Signatures saved to server");
    } catch (err) {
      console.log(err)
      toast.error("Failed to save signatures");
    }
  };

  const fetchSavedSignatures = useCallback(async () => {
    try {
      const res = await apiConnector("get", `signatures/${pdfDoc._id}`, null, {
        withCredentials: true,
      });
      if (Array.isArray(res?.signatures)) {
        setSignatures(res.signatures.map(sig => ({ ...sig, image: signatureImage, width: 100, height: 50 })));
      }
    } catch (err) {
      console.error("Error loading saved signatures", err);
    }
  }, [pdfDoc._id, signatureImage]);

  useEffect(() => {
    fetchSavedSignatureImage();
    fetchSavedSignatures();
  }, [fetchSavedSignatures]);

const handleExport = async () => {
  if (!signatures.length) return toast.error("No signatures placed to export");

  try {
    const response = await fetch(`${SERVER_BASE_URL}/${pdfDoc.filepath}`);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const existingPdfBytes = await response.arrayBuffer();
    const pdfDocInstance = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDocInstance.getPages();

    for (const sig of signatures) {
      if (!sig.image) {
        console.warn("No image for signature:", sig);
        continue;
      }

      const base64Data = sig.image.split(",")[1];
      const pngBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const pngImage = await pdfDocInstance.embedPng(pngBytes);

      const page = pages[sig.page - 1];
      const { width: pdfWidth, height: pdfHeight } = page.getSize();

      const container = containerRef.current;
      if (!container) continue;

      const domRect = container.getBoundingClientRect();
      const scaleX = pdfWidth / domRect.width;
      const scaleY = pdfHeight / domRect.height;

      const adjustedX = sig.x * scaleX;
      const adjustedY = sig.y * scaleY;

      page.drawImage(pngImage, {
        x: adjustedX,
        y: pdfHeight - adjustedY - sig.height * scaleY,
        width: sig.width * scaleX,
        height: sig.height * scaleY,
      });
    }

    const pdfBytes = await pdfDocInstance.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${pdfDoc.filename}-signed.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("PDF exported with signature ✅");

    if (isPublic && onComplete) onComplete();
  } catch (err) {
    console.error("❌ Export failed:", err);
    toast.error("Failed to export PDF with signature");
  }
};

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-0 z-30 bg-white shadow flex flex-wrap gap-3 p-3 rounded-md border mb-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {!isPublic && (
            <button onClick={goBack} className="px-3 py-1.5 bg-gray-300 text-sm rounded hover:bg-gray-400 flex items-center gap-2">
              <FaArrowLeft /> Back
            </button>
          )}
          {!isPublic && (
            <button onClick={() => setShowSavedModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2">
              <FaUniversity /> Saved
            </button>
          )}
          <button onClick={() => setShowPad(true)} className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center gap-2">
            <FaPenFancy /> Draw
          </button>
          <button onClick={() => setShowTextModal(true)} className="px-3 py-1.5 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 flex items-center gap-2">
            <FaFont /> Type
          </button>
          <button onClick={() => setSignMode(prev => !prev)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-2">
            {signMode ? <FaSign /> : <FaEye />} Mode
          </button>
        </div>
        <div className="flex items-center gap-2">
          {!isPublic && (
            <button onClick={handleSaveToServer} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-2">
              <FaSave /> Save
            </button>
          )}
          <button onClick={handleExport} className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 flex items-center gap-2">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div ref={containerRef} onClick={handlePlaceSignature} className="relative border bg-white shadow rounded-md p-2 flex justify-center min-h-[80vh]">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={`${SERVER_BASE_URL}/${pdfDoc.filepath}`} onPageChange={(e) => setCurrentPage(e.currentPage + 1)} />
        </Worker>

        {signatures.map((sig, idx) => (
          sig.page === currentPage && (
            <Rnd
              key={idx}
              default={{ x: sig.x, y: sig.y, width: sig.width, height: sig.height }}
              bounds="parent"
              enableResizing={signMode}
              disableDragging={!signMode}
              onDragStop={(e, d) => {
                const updated = [...signatures];
                updated[idx].x = d.x;
                updated[idx].y = d.y;
                setSignatures(updated);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const updated = [...signatures];
                updated[idx].width = parseInt(ref.style.width);
                updated[idx].height = parseInt(ref.style.height);
                updated[idx].x = position.x;
                updated[idx].y = position.y;
                setSignatures(updated);
              }}
            >
              <div className="relative">
                <img src={sig.image || signatureImage} alt="signature" className="w-full h-full" />
              </div>
            </Rnd>
          )
        ))}
      </div>

      {showSavedModal && (
        <SavedSignatureModal
          onClose={() => setShowSavedModal(false)}
          onSelect={(sig) => {
            setSignatureImage(sig);
            toast.success("Signature selected");
          }}
        />
      )}

      {showPad && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-200">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[420px] space-y-4">
            <h3 className="text-lg font-semibold text-center">Draw Your Signature</h3>
            <SignatureCanvas
              penColor="black"
              ref={sigPadRef}
              canvasProps={{ width: 400, height: 200, className: "rounded-md" }}
            />
            <div className="flex justify-between">
              <button onClick={() => sigPadRef.current.clear()} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-2"><FaTimes /> Clear</button>
              <button onClick={saveSignature} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><FaSave /> Save</button>
              <button onClick={() => setShowPad(false)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"><FaTimes /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showTextModal && (
        <TextSignatureModal
          onClose={() => setShowTextModal(false)}
          onSelect={(image) => {
            setSignatureImage(image);
            toast.success("Typed signature selected");
            setShowTextModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PDFEditor;

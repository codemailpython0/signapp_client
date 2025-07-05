import { useState } from "react";
import { toPng } from "html-to-image";
import { FaTimes } from "react-icons/fa";

// Fonts (make sure they're loaded in your index.html or imported via @fontsource)
const fonts = [
  { name: "Great Vibes", className: "font-great-vibes" },
  { name: "Dancing Script", className: "font-dancing" },
  { name: "Satisfy", className: "font-satisfy" },
];

const TextSignatureModal = ({ onClose, onSelect }) => {
  const [text, setText] = useState("John Doe");

  const handleSelect = async (ref) => {
    if (!ref) return;
    try {
      const dataUrl = await toPng(ref);
      onSelect(dataUrl);
      onClose();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
        >
          <FaTimes size={18} />
        </button>

        <h3 className="text-lg font-semibold mb-2">Type Your Signature</h3>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          placeholder="Enter your name"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {fonts.map((font, idx) => {
            let ref = document.createElement("div");
            return (
              <div
                key={idx}
                onClick={() => handleSelect(ref)}
                className="cursor-pointer hover:scale-105 transition transform bg-gray-50 rounded shadow p-3 flex items-center justify-center"
              >
                <div
                  ref={(node) => (ref = node)}
                  className={`${font.className} text-[28px]`}
                  style={{ fontWeight: 500 }}
                >
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextSignatureModal;

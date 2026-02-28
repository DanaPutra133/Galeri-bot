import React from "react";

export default function NotifModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-200 flex items-end justify-end pointer-events-none">
      <div className="w-full h-full absolute bg-black/40 pointer-events-auto" onClick={onClose}></div>
      <div className="relative m-6 mb-8 w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto animate-fadeInUp">
        <h2 className="text-lg font-bold mb-2 text-gray-900">Mau bot kamu masuk?</h2>
        <p className="text-gray-700 mb-4">Download template di bawah, edit sesuai dengan bot kamu lalu kirim ke owner untuk di Konfirmasi, Bot hanya boleh Base atau menggunakan API dari Betabotz/ Botcahx.</p>
        <a
          href="/template.json"
          download="template.json"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-3 text-center transition"
        >
          Download template.json
        </a>
        <div className="text-gray-800 text-sm mb-2">
          <span className="font-semibold">Nomor Owner:</span> <a href="https://wa.me/6281289694906" className="text-blue-600 underline">0812-8969-4906</a>
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

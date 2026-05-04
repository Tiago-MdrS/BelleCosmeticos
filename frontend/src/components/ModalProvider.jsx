import React, { useEffect, useState } from "react";
import { setModalHandler } from "../utils/modalService";

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setModalHandler(({ type, message }) => {
      return new Promise((resolve) => {
        setModal({
          type,
          message,
          value: "",
          resolve,
        });
      });
    });
  }, []);

  function close(result) {
    if (modal?.resolve) {
      modal.resolve(result);
    }

    setModal(null);
  }

  return (
    <>
      {children}

      {modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900">
              {modal.type === "confirm" ? "Confirmação" : "Informação necessária"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {modal.message}
            </p>

            {modal.type === "prompt" && (
              <input
                autoFocus
                value={modal.value}
                onChange={(e) =>
                  setModal((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-pink-500"
                placeholder="Digite aqui..."
              />
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => close(modal.type === "prompt" ? null : false)}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  close(modal.type === "prompt" ? modal.value : true)
                }
                className="flex-1 rounded-xl bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
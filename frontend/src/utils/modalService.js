let modalHandler = null;

export function setModalHandler(handler) {
  modalHandler = handler;
}

export function confirmModal(message) {
  if (!modalHandler) return Promise.resolve(window.confirm(message));

  return modalHandler({
    type: "confirm",
    message,
  });
}

export function promptModal(message) {
  if (!modalHandler) return Promise.resolve(window.prompt(message));

  return modalHandler({
    type: "prompt",
    message,
  });
}
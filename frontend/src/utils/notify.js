import toast from "react-hot-toast";
import { confirmModal, promptModal } from "./modalService";

export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast(msg),
  loading: (msg) => toast.loading(msg),

  confirm: (msg) => confirmModal(msg),
  prompt: (msg) => promptModal(msg),
};
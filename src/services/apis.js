export const AUTH_API = {
  REGISTER: "auth/register",
  LOGIN: "auth/login",
  VERIFY_OTP: "auth/verify-otp",
};

export const DOCUMENT_API = {
  UPLOAD: "docs/upload",
  LIST: "docs",
   DELETE: (id) => `docs/${id}`,
};
export const SIGNATURE_API = {
  SAVE_IMAGE: "saved-signature/save",
  GET_SAVED_IMAGE: "saved-signature/me",
   DELETE_SAVED_IMAGE: (index) => `saved-signature/delete/${index}`,
};
export const PUBLIC_SIGNATURE_API = {
  REQUEST_LINK: "public-signature/request",
  VIEW_DOCUMENT: (token) => `public-signature/view/${token}`,
  CONFIRM_SIGNATURE: (token) => `public-signature/confirm/${token}`,
};
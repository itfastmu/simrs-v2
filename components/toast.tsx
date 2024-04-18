"use client";

import { ToastContainer } from "react-toastify";

export default function Toast({ className }: { className: string }) {
  return <ToastContainer bodyClassName={className} />;
}

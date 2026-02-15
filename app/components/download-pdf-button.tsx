"use client"
import { ReactNode } from "react";

function downloadPdf() {
  fetch("/3x3-Begynnermetode.pdf").then(response => {
    response.blob().then(blob => {
      const fileURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = '3x3-Begynnermetode.pdf';
      link.click();
    })
  })
}

function DownloadPDFButton({ children }: { children?: ReactNode }) {
  return (
    <button
      className="hover:underline cursor-pointer font-semibold text-link-text"
      onClick={downloadPdf}
    >
      {children}
    </button>
  );
}

export default DownloadPDFButton;

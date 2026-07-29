import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { verificationUrl } from "@/lib/invoice-utils";

export function InvoiceQrCode({ token, size = 112 }: { token: string; size?: number }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(verificationUrl(token), {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [token, size]);

  if (!src) {
    return <div className="h-28 w-28 shrink-0 animate-pulse rounded-sm border border-slate-200 bg-slate-100" aria-hidden />;
  }

  return (
    <img
      src={src}
      alt="Scan QR code to verify this invoice online"
      width={size}
      height={size}
      className="h-28 w-28 shrink-0 rounded-sm border border-slate-200 bg-white p-1"
    />
  );
}

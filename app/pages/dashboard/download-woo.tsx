import React from "react";
import { Download } from "lucide-react";
import Footer from "~/components/derived/Footer";

export default function DownloadWoocomercePluginPage() {
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="flex flex-col justify-center w-full max-w-sm mx-auto gap-3">
        <h1 className="text-4xl font-bold text-wp text-center mb-4">
          Download Paylis WordPress Plugin
        </h1>

        <p className="text-center text-lg max-w-xl mb-6 text-gray-600">
          Paylis makes it easy to accept stablecoin payments in WooCommerce.
          Fast, secure, and easy to install.
        </p>

        <a
          href="https://github.com/fahmixls/paylis-woocomerce-payment-gateway/releases/download/alpha/paylis-woo-plugin.zip"
          download
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-wp hover:bg-sky-700 text-white font-semibold rounded-md shadow transition"
        >
          <Download className="w-5 h-5" />
          Download Plugin
        </a>

        <div className="mt-8 max-w-xl text-center text-sm text-gray-500">
          <p>
            After downloading, go to your WordPress admin dashboard → Plugins →
            Add New → Upload Plugin → Select <code>paylis.zip</code> → Install
            Now.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

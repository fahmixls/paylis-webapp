import { Link } from "react-router";
import Footer from "~/components/derived/Footer";

export default function CoomingSoon() {
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="px-6 py-20 w-full max-w-sm mx-auto h-full max-h-screen justify-center flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl text-gray-800 font-bold lg:text-4xl">
            Coming Soon
          </h2>
          <p className="text-gray-600 my-6">
            We're currently building this page. It’ll be ready soon—thanks for
            your patience!
          </p>
          <Link
            to="/"
            className="inline-block mt-4 px-4 py-2 bg-wp text-white font-semibold rounded hover:bg-sky-800 transition"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

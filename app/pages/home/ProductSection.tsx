import {
  Store,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";

export default function ProductSection() {
  const products = [
    {
      title: "Direct Payment",
      description:
        "Instantly send and receive stablecoin payments via wallet-to-wallet transactions. No plugins needed.",
      icon: <ArrowRight className="w-6 h-6 text-wp" aria-hidden="true" />,
      cta: "Try Direct Pay",
      href: "/transfer",
    },
    {
      title: "WooCommerce Payment Plugin",
      description:
        "Seamlessly accept stablecoin payments on your WooCommerce store. Fast, secure, and borderless.",
      icon: <ShoppingCart className="w-6 h-6 text-wp" aria-hidden="true" />,
      cta: "Install Plugin",
      href: "/download/woocommerce",
    },
    {
      title: "Easy Digital Downloads Plugin",
      description:
        "Enable crypto payments for digital products with stablecoins. No volatility, no friction.",
      icon: <Store className="w-6 h-6 text-wp" aria-hidden="true" />,
      cta: "Get Extension",
      href: "/coming-soon",
    },
    {
      title: "Creator Tipping Platform",
      description:
        "Let your fans tip using stablecoins. Perfect for creators, streamers, and educators.",
      icon: <DollarSign className="w-6 h-6 text-wp" aria-hidden="true" />,
      cta: "Start Earning",
      href: "/soming-soon",
    },
    {
      title: "API and SDK Integration",
      description:
        "Integrate stablecoin payments into any platform using our secure REST API and developer-friendly SDK.",
      icon: <Wallet className="w-6 h-6 text-wp" aria-hidden="true" />,
      cta: "View Docs",
      href: "/coming-soon",
    },
  ];

  return (
    <section
      className="bg-wp py-16 px-7 min-h-screen"
      aria-labelledby="products-heading"
      role="region"
      id="product-section"
    >
      <div className="w-full text-center">
        <h2
          id="products-heading"
          className="text-3xl md:text-4xl font-bold text-white mb-6"
        >
          Our <span className="font-extrabold text-yellow-500">Stablecoin</span>{" "}
          Payment Solutions
        </h2>
        <p className="text-slate-50 mb-14 mx-auto text-lg">
          Accept fast and stable crypto payments across WordPress plugins and
          content creator tools.{" "}
          <span className="font-extrabold text-yellow-500">
            No volatility. No borders{" "}
          </span>
          .
        </p>

        <ul className="flex gap-6 flex-col" role="list">
          {products.map((product, index) => (
            <li
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition focus-within:outline focus-within:outline-sky-700"
            >
              <article aria-labelledby={`product-title-${index}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-50 text-wp p-2 border border-yellow-200 rounded-full">
                    {product.icon}
                  </div>
                  <h3
                    id={`product-title-${index}`}
                    className="sm:text-xl text-lg font-semibold text-slate-700"
                  >
                    {product.title}
                  </h3>
                </div>
                <p className="text-base text-slate-600 mb-6">
                  {product.description}
                </p>
                <Link
                  className="inline-flex items-center gap-1 text-wp font-medium hover:underline focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-wp"
                  aria-label={`${product.cta} for ${product.title}`}
                  to={product.href}
                >
                  {product.cta}{" "}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

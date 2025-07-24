export default function Footer() {
  return (
    <footer className="w-full max-w-2xl mx-auto px-4">
      <div className="py-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <p className="text-xs text-gray-600">
              © 2025 Lukisan Ksatriya Labs.
            </p>
          </div>
          <ul className="flex flex-wrap items-center">
            <li className="inline-block relative pe-4 text-xs last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:rounded-full before:bg-gray-400">
              <a
                className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2"
                href="https://x.com/lukisxyz"
              >
                X (Twitter)
              </a>
            </li>
            <li className="inline-block pe-4 text-xs">
              <a
                className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-hidden focus:decoration-2"
                href="https://github.com/fahmixls"
              >
                Github
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

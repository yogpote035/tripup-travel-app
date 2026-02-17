import { useNavigate } from "react-router-dom";
import { MapPin, Home, ArrowLeft, Compass, Search } from "lucide-react";
import { FaPlane } from "react-icons/fa";

const PageNotFound = () => {
  const navigate = useNavigate();

  const perforation =
    "repeating-linear-gradient(90deg,#e8622a 0,#e8622a 12px,transparent 12px,transparent 20px)";

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 mt-5">
      <div className="max-w-2xl w-full">

        {/* ── Boarding Pass Card ── */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">

          {/* Top perforation */}
          <div className="h-1.5 w-full" style={{ background: perforation }} />

          {/* Header strip */}
          <div className="bg-stone-900 px-8 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-1">
                Boarding Pass
              </p>
              <p className="text-white font-black text-lg tracking-widest uppercase">
                TRIPUP AIRWAYS
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-stone-500 uppercase tracking-widest">From</p>
                <p className="text-white font-black text-2xl tracking-widest">YOU</p>
              </div>
              <FaPlane className="text-orange-400 text-xl mx-1" />
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest">To</p>
                <p className="text-orange-400 font-black text-2xl tracking-widest">???</p>
              </div>
            </div>
          </div>

          {/* Stub tear line */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
            <div
              className="flex-1 h-px mx-1"
              style={{
                background:
                  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)",
              }}
            />
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
          </div>

          {/* Main content */}
          <div className="px-8 py-8 text-center">
            {/* 404 */}
            <div className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-200 rounded-full px-5 py-1.5 mb-6">
              <Compass size={14} className="text-orange-500" />
              <span className="text-orange-600 font-black text-sm tracking-widest uppercase">
                Flight Not Found
              </span>
            </div>

            <h1 className="text-9xl font-black text-stone-900 tracking-tight leading-none mb-2">
              4<span className="text-orange-500">0</span>4
            </h1>

            <h2 className="text-2xl md:text-3xl font-black text-stone-800 uppercase tracking-wide mb-3">
              Lost in Transit
            </h2>
            <p className="text-stone-500 text-base mb-1">
              This route doesn't exist on our travel map.
            </p>
            <p className="text-stone-400 text-sm mb-8">
              The page may have been moved, deleted, or never existed.
            </p>

            {/* Status badges */}
            <div className="flex justify-center gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-2 border border-orange-200 bg-orange-50 px-4 py-2 rounded-full">
                <MapPin size={14} className="text-orange-400" />
                <span className="text-stone-500 text-xs font-semibold uppercase tracking-wide">
                  Route not found
                </span>
              </div>
              <div className="flex items-center gap-2 border border-orange-200 bg-orange-50 px-4 py-2 rounded-full">
                <Search size={14} className="text-orange-400" />
                <span className="text-stone-500 text-xs font-semibold uppercase tracking-wide">
                  Error 404
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-700 hover:text-orange-600 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wide"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-widest shadow-md"
              >
                <Home size={18} />
                Back to Home
              </button>
            </div>
          </div>

          {/* Stub tear line bottom */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -ml-6 flex-shrink-0" />
            <div
              className="flex-1 h-px mx-1"
              style={{
                background:
                  "repeating-linear-gradient(90deg,#d6c4a0 0,#d6c4a0 8px,transparent 8px,transparent 16px)",
              }}
            />
            <div className="w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-200 -mr-6 flex-shrink-0" />
          </div>

          {/* Help stub */}
          <div className="px-8 py-6 bg-stone-900">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">
              Gate Assistance
            </h3>
            <ul className="space-y-2">
              {[
                "Check the URL for any typos",
                "Return to the homepage and navigate from there",
                "Use the navigation menu to find what you're looking for",
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-400 text-xs">
                  <span className="font-black text-orange-400 text-xs w-4 flex-shrink-0">
                    0{i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Barcode footer */}
          <div className="bg-stone-900 px-8 pb-5 border-t border-stone-700">
            <div className="flex items-end gap-px h-8 mb-2">
              {[3,1,2,1,4,1,2,3,1,2,1,3,2,1,3,1,2,1,4,2,1,3,1,2,3,1,2,1,3].map((w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-sm"
                  style={{
                    width: `${w * 3}px`,
                    height: `${55 + (i % 3) * 18}%`,
                    opacity: 0.12 + (i % 4) * 0.18,
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs tracking-widest text-stone-600 uppercase font-semibold">
              TRIPUP · Yogesh Pote · 404
            </p>
          </div>

          {/* Bottom perforation */}
          <div className="h-1.5 w-full" style={{ background: perforation }} />
        </div>

      </div>
    </div>
  );
};

export default PageNotFound;
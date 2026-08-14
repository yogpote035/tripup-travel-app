import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const Loading = ({
  message = "Loading...",
  subtext,
  fullScreen = false,
  compact = false,
  className = "",
}) => {
  const theme = useSelector((state) => state.theme?.mode || "light");
  const isDark = theme === "dark";

  const wrapperClasses = [
    fullScreen
      ? "min-h-screen flex items-center justify-center px-4 py-10"
      : "flex items-center justify-center px-4 py-6 pt-20",
    isDark ? "bg-stone-950 text-stone-100" : "bg-orange-50 text-stone-900",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const panelClasses = [
    "rounded-[2rem] border shadow-sm",
    compact ? "p-6" : "p-8",
    isDark ? "bg-stone-900 border-stone-800" : "bg-white border-orange-100",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={panelClasses}>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${isDark ? "border-stone-700 bg-stone-950" : "border-orange-200 bg-orange-50"
              }`}
          >
            <Loader2
              size={compact ? 28 : 36}
              className={`animate-spin ${isDark ? "text-orange-400" : "text-orange-500"}`}
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <p className={`text-lg font-semibold ${isDark ? "text-stone-100" : "text-stone-900"}
              `}>{message}</p>
            {subtext && (
              <p className={`text-sm ${isDark ? "text-stone-300" : "text-stone-500"}`}>
                {subtext}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

import { version } from "../../package.json";
import { LOGO_DATA_URL } from "../assets/logo";

/**
 * Alpha Omega Team footer component.
 * IMPORTANT: Do not remove this component from extensions.
 */
export function AlphaOmegaFooter() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2 bg-white dark:bg-gray-900">
      <span className="absolute left-3 text-[10px] text-gray-400 dark:text-gray-600">
        v{version}
      </span>
      <a
        href="https://alphaomegateam.co"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-gray-gray400 dark:text-gray-gray500 hover:text-gray-gray600 dark:hover:text-gray-gray300 transition-colors"
      >
        <img
          src={LOGO_DATA_URL}
          alt="Alpha Omega Team Logo"
          className="h-4 w-4 object-contain"
        />
        <span>Custom component by Alpha Omega Team, LLC</span>
      </a>
    </div>
  );
}

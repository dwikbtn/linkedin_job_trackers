import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userPreference, setUserPreference] = useState<
    "light" | "dark" | "system"
  >("system");

  useEffect(() => {
    // Check for saved theme preference
    const saved = localStorage.getItem("theme-preference") as
      | "light"
      | "dark"
      | "system"
      | null;
    const preference = saved || "system";
    setUserPreference(preference);

    if (preference === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    } else {
      setIsDarkMode(preference === "dark");
    }

    // Listen for system theme changes only if user preference is 'system'
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (userPreference === "system") {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [userPreference]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setUserPreference(newTheme);
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme-preference", newTheme);
  };

  const url = browser.runtime.getURL("/jobApply.html");
  const handleOpenJobApply = () => {
    browser.tabs.create({ url });
  };

  return (
    <div
      className={`w-80 min-h-[400px] ${
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } border shadow-xl transition-colors duration-200 animate-fade-in rounded-lg overflow-hidden`}
    >
      <div className="p-6">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div
              className={`w-14 h-14 mx-auto mb-4 ${
                isDarkMode
                  ? "bg-blue-500 shadow-blue-500/25"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              } rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200`}
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6m0 0a2 2 0 012 2v6a2 2 0 01-2 2"
                />
              </svg>
            </div>
            <h1
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-2 transition-colors duration-200 text-center`}
            >
              LinkedIn Job Tracker
            </h1>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } text-sm transition-colors duration-200 text-center`}
            >
              Track and manage your job applications
            </p>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } rounded-lg flex items-center justify-center transition-all duration-200 group hover:scale-110 active:scale-95 ml-2`}
            title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          >
            {isDarkMode ? (
              <svg
                className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-5">
          {/* Primary Action Button */}
          <button
            onClick={handleOpenJobApply}
            className={`w-full ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/25"
            } text-white font-medium py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>View Applications</span>
          </button>

          {/* Quick Stats */}
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
            } border rounded-xl p-5 transition-all duration-200`}
          >
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-1 transition-colors duration-200`}
              >
                0
              </div>
              <div
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } text-sm font-medium transition-colors duration-200`}
              >
                Applications Tracked
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`p-4 ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 hover:text-white"
                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
              } border rounded-xl text-sm font-medium transition-all duration-200 group hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-8 h-8 ${
                    isDarkMode
                      ? "bg-green-500/20 text-green-400"
                      : "bg-green-100 text-green-600"
                  } rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <span>Add Job</span>
              </div>
            </button>
            <button
              className={`p-4 ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300 hover:text-white"
                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
              } border rounded-xl text-sm font-medium transition-all duration-200 group hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-8 h-8 ${
                    isDarkMode
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-purple-100 text-purple-600"
                  } rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span>Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`text-center pt-5 mt-6 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } transition-colors duration-200`}
        >
          <p
            className={`${
              isDarkMode ? "text-gray-500" : "text-gray-500"
            } text-xs transition-colors duration-200`}
          >
            Stay organized with your job search
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

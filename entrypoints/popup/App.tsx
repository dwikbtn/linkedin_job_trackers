import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center space-x-4 mb-6">
            <a
              href="https://wxt.dev"
              target="_blank"
              className="block transition-transform hover:scale-110"
            >
              <img src={wxtLogo} className="w-12 h-12" alt="WXT logo" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              className="block transition-transform hover:scale-110"
            >
              <img
                src={reactLogo}
                className="w-12 h-12 animate-pulse"
                alt="React logo"
              />
            </a>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            WXT + React
          </h1>

          <div className="text-center space-y-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 transform hover:scale-105"
            >
              Count is {count}
            </button>

            <p className="text-sm text-gray-600">
              Edit{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-red-600">
                entrypoints/popup/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 text-sm font-medium">
              🎉 Tailwind CSS is working! You can see the styling applied with
              utility classes.
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Click on the WXT and React logos to learn more
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

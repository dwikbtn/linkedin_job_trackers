import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-stone-50 relative">
      {/* Subtle background decoration matching other components */}
      <div className="absolute top-8 right-8 w-24 h-24 bg-stone-100 transform rotate-12 rounded-lg opacity-40"></div>
      <div className="absolute bottom-12 left-12 w-16 h-16 bg-amber-50 rounded-full opacity-60"></div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            {/* Custom loading spinner with beige accent */}
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-stone-200 border-t-amber-600 mx-auto mb-4"></div>
              <div
                className="absolute inset-0 rounded-full h-12 w-12 border-3 border-transparent border-r-amber-400 animate-spin mx-auto"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              ></div>
            </div>
            <p className="text-stone-600 font-medium">
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

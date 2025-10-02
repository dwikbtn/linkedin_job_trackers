import React from "react";

const Loading = () => {
  return (
    <div className="container-main">
      <div className="container-content">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

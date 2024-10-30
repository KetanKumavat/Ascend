import React from "react";

const layout = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {children}
    </div>
  );
};

export default layout;

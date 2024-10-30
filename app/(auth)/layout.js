import React from "react";

const layout = ({ children }) => {
  return (
    <div className="flex justify-center items-center pt-20 pb-5">
      {children}
    </div>
  );
};

export default layout;

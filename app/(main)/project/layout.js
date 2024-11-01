import React, { Suspense } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const ProjectLayout = ({ children }) => {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-96">
            <ClipLoader color="#84cc16" size={50} />
          </div>
        }>
        {children}
      </Suspense>
    </div>
  );
};

export default ProjectLayout;

import React from "react";

const page = ({ params }) => {
  const { projectId } = params;
  return <div>{projectId}</div>;
};

export default page;

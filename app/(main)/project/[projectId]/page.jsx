import React from "react";

const page = async ({ params }) => {
  const { projectId } = await params;
  return <div>{projectId}</div>;
};

export default page;

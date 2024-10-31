import React from "react";

const Organization = ({ params }) => {
  const { orgId } = params;
  return <div className="text-white">{orgId}</div>;
};

export default Organization;

import React from "react";

const Layout = ({ children }) => {
    return (
        <div className="mx-auto relative w-full min-h-screen">{children}</div>
    );
};

export default Layout;

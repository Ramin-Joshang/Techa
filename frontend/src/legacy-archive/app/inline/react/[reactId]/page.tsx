"use client";
import dynamic from "next/dynamic";
import React from "react";
const ReactArea = dynamic(
  () => import("../../../../components/inline/react/ReactAreaInline"),
  {
    ssr: false,
  }
);
const Page = () => {
  return <ReactArea />;
};

export default Page;

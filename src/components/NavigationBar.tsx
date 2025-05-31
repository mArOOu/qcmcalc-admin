import React from "react";
import HITlogo from "./HITLogo";
import { lazy } from "react";
import Link from "next/link";

export default function NavigationBar() {
  return (
    <div className="w-full bg-dark/5 border-b-1 border-solid lborder-light-800 backdrop-blur-md">
      <nav className="p-4 flex flex-row justify-between items-center my-1">
        <div className="">
          <Link href="/">
            <HITlogo />
          </Link>
          <span>
            <h1 className="text-light-300 text-2xl font-light">Dashboard</h1>
          </span>
        </div>
        <div
          className="font-semibold text-xs flex-row space-x-6 px-5 font-Inter text-light-200 
          md:flex md:font-bold md:text-[13px]">
          <Link
            href="https://linktr.ee/Health._it"
            target="blank"
            className="flex hover:text-light">
            Contactez Nous
          </Link>
        </div>
      </nav>
    </div>
  );
}

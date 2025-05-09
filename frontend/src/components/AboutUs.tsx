import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type AboutUsProps = {
  abtUsTitle: string;
  description: string;
  ourTeam: string;
};

export default function AboutUs({
  abtUsTitle,
  description,
  ourTeam,
}: AboutUsProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-600 px-4 text-center">
      {/* Optional mascot image */}
      <Image
        src="/images/Trash-chan .png"
        alt="Cartoon Can Mascot"
        width={180}
        height={180}
        className="mascot rounded-lg border-2 border-lime-500 mb-4"
      />

      {/* The description for the about us page */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl border-t-4 border-lime-500">
        <h1 className="text-2xl font-bold text-lime-800 mb-4">{abtUsTitle}</h1>
        <p className="text-cyan-950 leading-relaxed">{description}</p>
        <h2 className="text-xl font-semibold text-lime-800 mt-6 mb-2">
          {ourTeam}
        </h2>
      </div>
      {/* Back button in top-left corner */}
      <Link
        href="/"
        className="bg-lime-500 text-lime-800 px-4 py-2 rounded hover:bg-lime-600 flex items-center gap-2 mt-4"
      >
        ← Back
      </Link>
    </div>
  );
}

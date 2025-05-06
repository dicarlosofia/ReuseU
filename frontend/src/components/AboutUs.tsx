import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from "next/image";

export default function AboutPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-600 px-4 text-center">

        {/* Optional mascot image */}
        <Image
        src="/images/trashcan_test_image.jpg"
        alt="Cartoon Can Mascot"
        width={180}
        height={180}
        className="mascot rounded-lg border-2 border-lime-500 mb-4"
        />
  
        {/* The description for the about us page */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl border-t-4 border-lime-500">
          <h1 className="text-2xl font-bold text-lime-800 mb-4">ABOUT US:</h1>
          <p className="text-cyan-950 leading-relaxed">
            ReuseU is a sustainability project for college students, by college
            students. On move-out day, do you find that you have a bunch of
            stuff you don't need anymore? Or, during the school year, you need
            a new coffee maker, but the ones at the store are too expensive?
            Worry no longer! We as a team set out to create a way for students
            to buy and exchange their goods throughout the year. The average
            college student creates 640 pounds of trash annually, and our hope
            is that ReuseU will become a place for students to help reduce and
            reuse items that students accumulate throughout the year. We as a
            team came together through the trenches of our Grinnell College
            Software Development class, CSC-324, and this is the project that
            resulted from that!
          </p>
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
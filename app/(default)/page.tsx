"use client";
import Image from "next/image";
import { FormEvent, useState } from "react";
import copy_svg from "../../public/copy-svgrepo-com.svg";
import axios from "axios";
import Spinner from "@/components/Spinner";
import toast, { Toaster } from "react-hot-toast";
import "../globals.css";

interface StoredUrl {
  longUrl: string;
  shortenedUrl: string;
}

export default function Home() {
  const [longUrl, setLongUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [Loading, setLoading] = useState<boolean>(false);
  const [isLongUrlEmpty, setIsLongUrlEmpty] = useState<boolean>(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!longUrl) {
      setIsLongUrlEmpty(true);
      setLoading(false);
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      const response = await axios.post(
        "api/urlshortener",
        { longUrl },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newShortenedUrl = response.data.data; // Get the shortened URL from response
      setShortenedUrl(newShortenedUrl);
      toast.success("Your URL has been shortened successfully.");

      // Store the generated short URL with the original long URL in local storage
      storeUrlInLocalStorage(longUrl, newShortenedUrl);
    } catch (err) {
      toast.error("Couldn't generate now. Please try again later");
    }
    setLoading(false);
  };

  const storeUrlInLocalStorage = (
    longUrl: string,
    shortenedUrl: string
  ): void => {
    // Retrieve existing URLs from local storage
    const storedUrlsJSON = localStorage.getItem("urlList");
    let storedUrls: StoredUrl[] = [];

    if (storedUrlsJSON) {
      storedUrls = JSON.parse(storedUrlsJSON); // Parse only if not null
    }

    // Create a new URL object
    const newUrl: StoredUrl = { longUrl, shortenedUrl };

    // Add the new URL to the existing list without duplicates
    if (!storedUrls.some((url) => url.shortenedUrl === shortenedUrl)) {
      const updatedUrls = [...storedUrls, newUrl];
      localStorage.setItem("urlList", JSON.stringify(updatedUrls)); // Save the updated URL list
      console.log("Stored URLs:", updatedUrls); // For debugging
    }
  };

  const copyToClipboard = () => {
    if (!shortenedUrl) return;
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${shortenedUrl}`
    );
    toast.success("Copied to clipboard");
    setCopiedToClipboard(true);
  };

  return (
    <div className={`relative`}>
      <h1 className="text-5xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-8 pb-4">
        Shorten Your Looong Links :)
      </h1>
      <p className="text-gray-400 mb-8">
        TTURL is an efficient and easy-to-use URL shortening service that
        streamlines your online experience.
      </p>

      <form onSubmit={handleGenerate}>
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Enter the link here"
            className={`w-full px-6 py-3 bg-gray-800 text-gray-300 rounded-full outline-none focus:ring-2 focus:ring-blue-500 ${
              isLongUrlEmpty ? "shake" : "outline-none"
            }`}
            onChange={(e) => {
              setLongUrl(e.target.value);
              setCopiedToClipboard(false);
              setIsLongUrlEmpty(false);
            }}
          />
          <button
            className="absolute h-10 w-40 right-0 top-0 my-1 mr-1 px-6 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-500"
            type="submit"
          >
            {Loading ? <Spinner /> : "Shorten Now!"}
          </button>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <div className="text-gray-400">Your shortened URL:</div>
          <div
            className={`flex w-full h-12 rounded-md items-center px-4 bg-gray-800 ${
              copiedToClipboard
                ? "border border-green-500"
                : "border border-gray-700"
            }`}
          >
            <div className="w-[240px] truncate text-white">
              {shortenedUrl ? (
                `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${shortenedUrl}`
              ) : (
                <span className="text-gray-500">
                  https://example.com/aadfasdfasdfasdfasdf
                </span>
              )}
            </div>
            <button
              className="ml-auto flex justify-end"
              onClick={copyToClipboard}
              type="button"
            >
              <Image src={copy_svg} alt="copy" className="h-5 w-5" />
            </button>
          </div>
        </div>
        <Toaster position="top-right" />
      </form>
    </div>
  );
}

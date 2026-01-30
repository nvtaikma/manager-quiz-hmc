"use client";

import { useEffect, useState } from "react";
import { API_URLS } from "@/contants/api";

export default function DebugPage() {
  const [info, setInfo] = useState({
    url: "",
    origin: "",
    cookies: "",
    userAgent: "",
    apiUrls: API_URLS,
  });

  useEffect(() => {
    setInfo({
      url: window.location.href,
      origin: window.location.origin,
      cookies: document.cookie,
      userAgent: navigator.userAgent,
      apiUrls: API_URLS,
    });
  }, []);

  const testApiCall = async () => {
    try {
      console.log("Testing API call to:", API_URLS.AUTH_CHECK);
      const response = await fetch(API_URLS.AUTH_CHECK);
      const data = await response.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Current URL:</strong> {info.url}
            </div>
            <div>
              <strong>Origin:</strong> {info.origin}
            </div>
            <div>
              <strong>User Agent:</strong> {info.userAgent}
            </div>
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </div>
          </div>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API URLs</h2>
          <div className="space-y-1 text-sm">
            {Object.entries(info.apiUrls).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Cookies</h2>
          <div className="text-sm">{info.cookies || "No cookies found"}</div>
        </div>

        <div className="space-y-2">
          <button
            onClick={testApiCall}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test API Call
          </button>
        </div>
      </div>
    </div>
  );
}

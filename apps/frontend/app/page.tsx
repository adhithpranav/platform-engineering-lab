"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("INITIAL STATE");

  useEffect(() => {
    console.log("USE EFFECT STARTED");

    fetch("http://52.66.183.220:8000")
      .then((res) => {
        console.log("FETCH RESPONSE", res);
        return res.json();
      })
      .then((data) => {
        console.log("FETCH DATA", data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("FETCH ERROR", err);
        setMessage("FETCH FAILED");
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-5xl font-bold">
        {message}
      </div>
    </main>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MainPage from "./feature/Pages/MainPage";
import AccessGate from "./feature/AccessGate";

export default function CreateLessonPage() {
  const { data: session, status } = useSession();

  // state the MainPage expects (just like your React app)
  const [loading, setLoading] = useState(false);
  const [genSlides, setGenSlides] = useState(false);
  const [finalModal, setFinalModal] = useState(false);

  if (status === "loading") return <div>Loading...</div>;

  // Not logged in: show a friendly gate (no form shown)
  if (!session) {
    return <AccessGate />;
  }

  // Logged in: render the Main Page form
  return (
    <MainPage
      setLoading={setLoading}
      setGenSlides={setGenSlides}
      setFinalModal={setFinalModal}
    />
  );
}

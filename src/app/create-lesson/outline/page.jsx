"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import OutlinePage from "../feature/Pages/OutlinePage";
import AccessGate from "../feature/AccessGate";
import { LoadingScreen, FinalModal } from "../feature/Loaders";

export default function OutlineRoutePage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [queueStatus, setQueueStatus] = useState("");

  if (status === "loading") return null;
  if (status !== "authenticated") {
    return <AccessGate nextPath="/create-lesson/outline" />;
  }

  return (
    <>
      {/* Render loader overlay when backend processing is underway */}
      {loading && <LoadingScreen status={queueStatus} />}
      {/* Render final modal when slides generation is complete */}
      {finalModal && <FinalModal setFinalModal={setFinalModal} />}
      <OutlinePage
        setLoading={setLoading}
        setFinalModal={setFinalModal}
        setQueueStatus={setQueueStatus}
      />
    </>
  );
}

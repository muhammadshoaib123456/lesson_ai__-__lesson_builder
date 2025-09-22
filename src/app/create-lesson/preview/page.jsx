"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import SlidesPreview from "../feature/Pages/SlidesPreview";
import { FinalModal } from "../feature/Loaders";
import AccessGate from "../feature/AccessGate";

export default function PreviewRoutePage() {
  const { status } = useSession();
  const [finalModal, setFinalModal] = useState(false);

  if (status === "loading") return null;
  if (status !== "authenticated") {
    return <AccessGate nextPath="/create-lesson/preview" />;
  }

  return (
    <>
      {finalModal && <FinalModal setFinalModal={setFinalModal} />}
      <SlidesPreview setFinalModal={setFinalModal} />
    </>
  );
}

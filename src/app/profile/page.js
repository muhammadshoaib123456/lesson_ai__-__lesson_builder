// profile/page.js
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileEditor from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen text-black">
      <Header />

      {/* Main content area grows to push footer down */}
      <main className="flex-grow max-w-[1054px] mx-auto px-4 py-10 w-full">
        {!session ? (
          <p>
            Please{" "}
            <a className="underline" href="/login?next=/profile">
              log in
            </a>.
          </p>
        ) : (
          <ProfileEditor />
        )}
      </main>

      <Footer />
    </div>
  );
}

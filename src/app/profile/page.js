import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileEditor from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header />
      <div className="max-w-[900px] mx-auto px-4 py-10 text-black">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {!session ? (
          <p>Please <a className="underline" href="/login?next=/profile">log in</a>.</p>
        ) : (
          <ProfileEditor />
        )}
      </div>
      <Footer />
    </>
  );
}

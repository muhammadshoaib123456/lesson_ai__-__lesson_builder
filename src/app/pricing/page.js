import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen text-black">
      <Header />

      {/* Main content expands to fill space */}
      <main className="flex-grow max-w-[900px] mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold mb-6">Pricing & Subscription</h1>
        <p className="text-gray-600">Show your plans here.</p>
      </main>

      <Footer />
    </div>
  );
}

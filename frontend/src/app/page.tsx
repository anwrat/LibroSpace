import Image from "next/image";
import LandingNav from "@/components/Navbar/LandingNav";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <LandingNav />
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <Image
          className=""
          src="/Landing/centreguy.png"
          alt="Center Guy"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/girl1.png"
          alt="Girl 1"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/girl2.png"
          alt="Girl 2"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/guy1.png"
          alt="Guy 2"
          width={100}
          height={20}
          priority
        />
        {/* font-main uses Inter font */}
        <h1 className="text-5xl font-semibold font-main">Because books are better when shared!</h1>
        <p className="italic text-xl font-main">Track your reads, join discussions and celebrate the joy of reading</p>
      </main>
    </div>
  );
}

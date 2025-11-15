import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <Image
          className=""
          src="/Landing/centreguy.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/girl1.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/girl2.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <Image
          className=""
          src="/Landing/guy1.png"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1 className="text-4xl">Because books are better when shared!</h1>
        <p>Track your reads, join discussions and celebrate the joy of reading</p>
      </main>
    </div>
  );
}

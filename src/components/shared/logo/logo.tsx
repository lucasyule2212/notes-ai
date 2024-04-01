import Image from 'next/image'

const Logo = () => {
  return (
    <span className="group flex space-x-1">
      <Image
        src="/logo-icon.png"
        width={500}
        height={500}
        className="mb-auto mt-auto h-6 w-6"
        alt="logo-icon"
      />
      <h1 className="gradient-text font-cookie text-5xl">Canva</h1>
      <h1 className="bg-black bg-[length:200%_100%] bg-clip-text text-4xl font-bold transition-colors group-hover:animate-shimmer group-hover:bg-[linear-gradient(110deg,#000103,45%,#7a7f88,55%,#000103)] group-hover:text-transparent ">
        AI
      </h1>
    </span>
  )
}

export default Logo

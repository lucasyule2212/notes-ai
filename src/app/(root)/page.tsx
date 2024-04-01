import { Collection } from '@/components/shared/collection/collection'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { getAllImages } from '@/lib/actions/image.actions'
import { navLinks } from '@/lib/consts'
import Image from 'next/image'
import Link from 'next/link'

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1
  const searchQuery = (searchParams?.query as string) || ''

  const images = await getAllImages({
    page,
    searchQuery,
  })

  return (
    <div>
      <AuroraBackground
        // showRadialGradient={false}
        className="sm:flex-center hidden h-72 flex-col gap-4 rounded-[20px] border bg-banner bg-cover p-10"
      >
        <h1 className="h1-semibold z-10 max-w-[500px] flex-wrap gap-1 text-center text-white">
          Unleash Your Creative Vision with{' '}
          <span className="space-x-1">
            <span className="font-cookie text-5xl">Canva</span>
            <span className="text-4xl font-bold">AI</span>
          </span>
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </AuroraBackground>
      <section className="sm:mt-12">
        <Collection
          images={images?.data}
          page={page}
          totalPages={images?.totalPage}
          hasSearch
        />
      </section>
    </div>
  )
}

export default Home

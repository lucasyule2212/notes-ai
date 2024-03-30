'use client'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { navLinks } from '@/lib/consts/navLinks'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '../logo/logo'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-72 bg-white p-5 shadow-md shadow-purple-200/50 lg:flex">
      <div className="flex size-full flex-col gap-4">
        <Link href="/" className="flex items-center gap-2 md:py-2">
          <Logo />
        </Link>
        <nav className="h-full flex-col justify-between md:flex md:gap-4">
          <SignedIn>
            <ul className="hidden w-full flex-col items-start gap-2 md:flex">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = pathname === link.route
                return (
                  <li
                    key={link.route}
                    data-isactive={isActive}
                    className="flex-center p-16-semibold group w-full whitespace-nowrap rounded-full  bg-cover text-gray-700 transition-all hover:bg-purple-100 hover:shadow-inner data-[isactive=true]:bg-purple-gradient data-[isactive=true]:text-white"
                  >
                    <Link
                      key={link.label}
                      href={link.route}
                      className="p-16-semibold flex size-full gap-4 p-4"
                    >
                      <Image
                        alt={link.label}
                        width={24}
                        height={24}
                        src={link.icon}
                        data-isactive={isActive}
                        className="data-[isactive=true]:brightness-200"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <ul className="hidden w-full flex-col items-start gap-2 md:flex">
              {navLinks.slice(6, 8).map((link) => {
                const isActive = pathname === link.route
                return (
                  <li
                    key={link.route}
                    data-isactive={isActive}
                    className="flex-center p-16-semibold group w-full whitespace-nowrap rounded-full  bg-cover text-gray-700 transition-all hover:bg-purple-100 hover:shadow-inner data-[isactive=true]:bg-purple-gradient data-[isactive=true]:text-white"
                  >
                    <Link
                      key={link.label}
                      href={link.route}
                      className="p-16-semibold flex size-full gap-4 p-4"
                    >
                      <Image
                        alt={link.label}
                        width={24}
                        height={24}
                        src={link.icon}
                        data-isactive={isActive}
                        className="data-[isactive=true]:brightness-200"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
              <li className="flex-center cursor-pointer gap-2 p-4">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="flex w-full items-center justify-center space-x-2 bg-white"
              >
                <span className="gradient-text w-52 font-bold">Login</span>
              </HoverBorderGradient>
            </Link>
          </SignedOut>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar

'use client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { navLinks } from '@/lib/consts'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '../logo/logo'

const MobileNav = () => {
  const pathname = usePathname()
  return (
    <header className="flex-between fixed h-16 w-full border-b-4 border-purple-100 bg-white p-5 lg:hidden">
      <Link href="/" className="flex items-center gap-2 md:py-2">
        <Logo />
      </Link>
      <nav className="flex gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger>
              <Image
                src="/assets/icons/menu.svg"
                alt="menu"
                width={32}
                height={32}
                className="cursor-pointer"
              />
            </SheetTrigger>
            <SheetContent className="focus:ring-0 focus:ring-offset-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-transparent focus-visible:ring-offset-0 sm:w-64">
              <>
                <Logo />
                <ul className="mt-8 flex w-full flex-col items-start gap-5">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.route
                    return (
                      <li
                        key={link.route}
                        data-isactive={isActive}
                        className="data-[isactive=true]:gradient-text p-18 flex whitespace-nowrap text-dark-700"
                      >
                        <Link
                          key={link.label}
                          href={link.route}
                          className="p-16-semibold flex size-full cursor-pointer gap-4 p-4 "
                        >
                          <Image
                            alt={link.label}
                            width={24}
                            height={24}
                            src={link.icon}
                          />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </>
            </SheetContent>
          </Sheet>
        </SignedIn>
        <SignedOut>
          <Button
            asChild
            className="flex-center p-16-semibold gap-3 rounded-full bg-purple-gradient bg-cover px-6 py-4 focus-visible:ring-transparent focus-visible:ring-offset-0"
          >
            <Link href="/sign-in" />
          </Button>
        </SignedOut>
      </nav>
    </header>
  )
}

export default MobileNav

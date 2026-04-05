import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader({ darkText = false, hideNav = false }: { darkText?: boolean, hideNav?: boolean }) {
  return (
    <nav className={`absolute top-0 w-full z-50 font-sans pointer-events-none ${darkText ? 'text-zinc-900' : 'text-white'}`}>
      <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-8 lg:px-24 py-6">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/" className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
            ZURI
          </Link>
        </div>

        {!hideNav && (
          <div className="hidden lg:flex items-center gap-10 text-base font-medium tracking-wide pointer-events-auto ml-16">

            <a href="/#features" className="hover:opacity-70 transition-opacity">Features</a>
            <a href="/#integrations" className="hover:opacity-70 transition-opacity">Integrations</a>
            <a href="/#team" className="hover:opacity-70 transition-opacity">Team</a>
            <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact Us</Link>
          </div>
        )}

        <div className="flex items-center pointer-events-auto">
          {/* Real button in white to contrast mix-blend-difference */}
          <Button asChild className={darkText ? "rounded-full px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-base font-semibold tracking-tight h-12 shadow-xl" : "rounded-full px-8 bg-white hover:bg-white/90 text-black text-base font-semibold tracking-tight h-12 shadow-xl"}>

            <Link href="/signup">Book a Demo</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

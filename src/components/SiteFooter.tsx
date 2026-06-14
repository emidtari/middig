import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-semibold">Middig</div>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An independent gallery of web design. Updated regularly with new work from studios and independents around the world.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium">Explore</div>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
            <li><Link to="/submit" className="hover:text-foreground">Submit a site</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium">Connect</div>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Middig</span>
          <span>Made with care</span>
        </div>
      </div>
    </footer>
  );
}

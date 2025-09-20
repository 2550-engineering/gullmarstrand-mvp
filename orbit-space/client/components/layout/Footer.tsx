export default function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container py-10 text-sm text-muted-foreground grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-2">
          <p className="text-foreground font-semibold">Looply</p>
          <p>From everyday essentials to hidden gems near you.</p>
          <p className="mt-2">© {new Date().getFullYear()} Looply. All rights reserved.</p>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 xl:col-span-3">
          <a href="#" className="hover:text-foreground">About us</a>
          <a href="#" className="hover:text-foreground">Help</a>
          <a href="#" className="hover:text-foreground">Accessibility</a>
          <a href="#" className="hover:text-foreground">Customer security</a>
          <a href="#" className="hover:text-foreground">Discover</a>
        </nav>
      </div>
    </footer>
  );
}

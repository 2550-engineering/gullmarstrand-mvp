import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-lg" aria-label="Looply Home">
            <span className="h-6 w-6 rounded-md bg-primary/90"></span>
            <span>Looply</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLink to="/" className={({isActive}) => isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>Home</NavLink>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground focus:outline-none">
                <span>Shop</span>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/shop">All</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop?category=Fashion">Fashion</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop?category=Home">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop?category=Tech">Tech</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop?category=Beauty">Beauty</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop?category=Outdoors">Outdoors</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex flex-1 items-center gap-2 md:gap-4 justify-end">
          <div className="hidden md:flex items-center gap-2 w-full max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input className="pl-9" placeholder="Search products" aria-label="Search products" />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
            <Button asChild size="sm"><Link to="/register">Register</Link></Button>
          </nav>
          <Button asChild variant="secondary" className="relative">
            <Link to="/checkout" aria-label="Open cart and checkout">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 h-5 min-w-[1.25rem] rounded-full bg-primary text-primary-foreground text-xs grid place-items-center px-1">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

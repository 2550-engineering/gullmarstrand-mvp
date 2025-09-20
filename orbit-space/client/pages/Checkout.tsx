import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Checkout() {
  const { items, total, setQuantity, removeItem, clear } = useCart();

  return (
    <section className="container py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Checkout</h1>
          <p className="mt-1 text-muted-foreground">Secure checkout with accessible forms.</p>
        </div>

        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-6">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <Input id="email" type="email" required placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="first">First name</label>
                <Input id="first" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="last">Last name</label>
                <Input id="last" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="address">Address</label>
                <Input id="address" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="city">City</label>
                <Input id="city" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="zip">ZIP</label>
                <Input id="zip" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="card">Card number</label>
                <Input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" required />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit" className="flex-1">Pay ${total.toFixed(2)}</Button>
                <Button type="button" variant="secondary" onClick={clear}>Clear cart</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-4">
              {items.length === 0 && (
                <p className="text-muted-foreground">Your cart is empty.</p>
              )}
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-16 w-16 rounded-md object-cover" />
                  <div className="flex-1">
                    <div className="font-medium leading-tight">{i.title}</div>
                    <div className="text-sm text-muted-foreground">${i.price.toFixed(2)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-muted-foreground" htmlFor={`qty-${i.id}`}>Qty</label>
                      <Input
                        id={`qty-${i.id}`}
                        type="number"
                        min={1}
                        max={99}
                        value={i.quantity}
                        onChange={(e) => setQuantity(i.id, Number(e.target.value))}
                        className="h-8 w-16"
                        aria-label={`Quantity for ${i.title}`}
                      />
                      <Button variant="ghost" onClick={() => removeItem(i.id)} aria-label={`Remove ${i.title}`}>Remove</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">${total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
}

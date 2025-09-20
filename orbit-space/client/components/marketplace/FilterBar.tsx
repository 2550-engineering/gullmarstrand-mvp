import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES } from "@/lib/listings";

export type Filters = {
  q: string;
  category: string | "All";
  maxPrice: number;
  minRating: number;
  maxDistance: number;
};

export function FilterBar({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Search</span>
        <Input
          placeholder="Search listings"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          aria-label="Search listings"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Category</span>
        <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v })}>
          <SelectTrigger aria-label="Category filter">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem value={c} key={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Max price (${value.maxPrice})</span>
        <Slider
          value={[value.maxPrice]}
          onValueChange={([v]) => onChange({ ...value, maxPrice: v })}
          min={10}
          max={10000}
          step={1}
          aria-label="Max price"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Min rating ({value.minRating}★)</span>
        <Slider
          value={[value.minRating]}
          onValueChange={([v]) => onChange({ ...value, minRating: v })}
          min={1}
          max={5}
          step={0.1}
          aria-label="Minimum rating"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Max distance ({value.maxDistance} km)</span>
        <Slider
          value={[value.maxDistance]}
          onValueChange={([v]) => onChange({ ...value, maxDistance: v })}
          min={1}
          max={50}
          step={1}
          aria-label="Maximum distance"
        />
      </label>
    </div>
  );
}

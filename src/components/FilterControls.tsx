import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterControlsProps {
  genres: string[];
}

export function FilterControls({ genres }: FilterControlsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGenre = searchParams.get('genre');
  const activeStatus = searchParams.get('status');

  const handleStatusChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === 'All') {
      newSearchParams.delete('status');
    } else {
      newSearchParams.set('status', value);
    }
    setSearchParams(newSearchParams);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Genres</h3>
        <div className="flex flex-wrap gap-2">
          <Link to=".">
            <Badge
              variant={!activeGenre ? "default" : "secondary"}
              className="capitalize cursor-pointer"
            >
              All
            </Badge>
          </Link>
          {genres.map(genre => (
            <Link key={genre} to={`?genre=${genre}${activeStatus ? `&status=${activeStatus}` : ''}`}>
              <Badge
                variant={activeGenre === genre ? "default" : "secondary"}
                className="capitalize cursor-pointer"
              >
                {genre}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Status</h3>
        <Select onValueChange={handleStatusChange} value={activeStatus || 'All'}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="TERSEDIA">Tersedia</SelectItem>
            <SelectItem value="DIPINJAM">Dipinjam</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

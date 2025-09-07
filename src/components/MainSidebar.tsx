import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Book, Home, Settings, Tag, Filter, Library, Globe, CheckCircle, Circle } from "lucide-react";
import { cn } from '@/lib/utils';

const fetchGenres = async (): Promise<string[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/genres`);
  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }
  return response.json();
};

const fetchLanguages = async (): Promise<string[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/languages`);
  if (!response.ok) {
    throw new Error('Failed to fetch languages');
  }
  return response.json();
};

const FilterGroup = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div>
    <h2 className="px-2 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">{icon} {title}</h2>
    <div className="space-y-1 pl-2">
      {children}
    </div>
  </div>
);

const FilterLink = ({ to, label, isActive }: { to: string, label: string, isActive: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors duration-200",
      isActive && "bg-muted font-semibold text-primary"
    )}
  >
    {isActive ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
    <span className="capitalize">{label}</span>
  </Link>
);

export function MainSidebar() {
  const { data: genres = [], isLoading: isLoadingGenres } = useQuery<string[]>({ queryKey: ['genres'], queryFn: fetchGenres });
  const { data: languages = [], isLoading: isLoadingLanguages } = useQuery<string[]>({ queryKey: ['languages'], queryFn: fetchLanguages });
  const [searchParams] = useSearchParams();

  const currentGenre = searchParams.get('genre');
  const currentStatus = searchParams.get('status');
  const currentLanguage = searchParams.get('language');

  const statuses = ['TERSEDIA', 'DIPINJAM'];

  return (
    <aside className="hidden md:flex w-72 flex-col border-r bg-zinc-50/95 dark:bg-zinc-900/95 text-foreground backdrop-blur-sm">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
          <Library className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter">Books Library</h1>
      </div>
      <nav className="flex-1 p-4 space-y-6 text-sm font-medium overflow-y-auto">
        <div>
          <h2 className="px-2 mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Browse</h2>
          <Link to="/" className={cn("flex items-center gap-3 p-2 rounded-md hover:bg-muted", !currentGenre && !currentStatus && !currentLanguage && "bg-muted font-semibold text-primary")}>
            <Home className="h-5 w-5" />
            <span>All Books</span>
          </Link>
        </div>
        <FilterGroup title="Status" icon={<Filter size={14} />}>
          {statuses.map(status => (
            <FilterLink key={status} to={`/?status=${status}`} label={status.toLowerCase()} isActive={currentStatus === status} />
          ))}
        </FilterGroup>
        <FilterGroup title="Genres" icon={<Tag size={14} />}>
          {isLoadingGenres ? <p className="p-2 text-muted-foreground">Loading...</p> : 
            genres.map(genre => (
              <FilterLink key={genre} to={`/?genre=${genre}`} label={genre} isActive={currentGenre === genre} />
            ))
          }
        </FilterGroup>
        <FilterGroup title="Languages" icon={<Globe size={14} />}>
          {isLoadingLanguages ? <p className="p-2 text-muted-foreground">Loading...</p> : 
            languages.map(language => (
              <FilterLink key={language} to={`/?language=${language}`} label={language} isActive={currentLanguage === language} />
            ))
          }
        </FilterGroup>
      </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 group">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors duration-200">
            <AvatarImage src="https://avatar.vercel.sh/anonymous" alt="Anonymous User" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Anonymous User</span>
            <span className="text-xs text-muted-foreground">Explorer</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

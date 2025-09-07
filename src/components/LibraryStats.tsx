import { Book } from "@/types/book";
import { BookOpen, Users, TrendingUp, Star } from "lucide-react";

interface LibraryStatsProps {
  books: Book[];
}

export const LibraryStats = ({ books }: LibraryStatsProps) => {
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.status === "available").length;
  const borrowedBooks = books.filter(book => book.status === "borrowed").length;
  const averageRating = books.reduce((sum, book) => sum + book.rating, 0) / totalBooks || 0;

  const stats = [
    {
      title: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Available",
      value: availableBooks,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Borrowed",
      value: borrowedBooks,
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Avg Rating",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gradient-card rounded-2xl p-6 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
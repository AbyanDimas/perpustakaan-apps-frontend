import { useQuery } from '@tanstack/react-query';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface DailyVisitor {
  id: string;
  date: string;
  count: number;
}

const fetchAnalytics = async (): Promise<DailyVisitor[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};

export default function AnalyticsPage() {
  const { data: analyticsData = [], isLoading, isError } = useQuery<DailyVisitor[]>({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  const formattedData = analyticsData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    visitors: item.count,
  }));

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Visitor Analytics</h1>
      <div className="bg-card p-4 rounded-md h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Progress value={50} className="w-1/2" />
          </div>
        ) : isError ? (
          <p>Error fetching analytics data.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visitors" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
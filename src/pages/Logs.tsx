import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface Log {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

const fetchLogs = async (): Promise<Log[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`);
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  return response.json();
};

const deleteLogs = async (): Promise<void> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete logs');
  }
};

export default function LogsPage() {
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading, isError } = useQuery<Log[]>({ queryKey: ['logs'], queryFn: fetchLogs });

  const deleteMutation = useMutation({
    mutationFn: deleteLogs,
    onSuccess: () => {
      toast.success('All logs deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
    onError: () => {
      toast.error('Failed to delete logs.');
    },
  });

  const handleDeleteAll = () => {
    if (confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">User Activity Logs</h1>
        <Button onClick={handleDeleteAll} disabled={deleteMutation.isPending || logs.length === 0} variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete All Logs'}
        </Button>
      </div>
      <div className="bg-card p-4 rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Progress value={50} className="w-1/2" />
          </div>
        ) : isError ? (
          <p>Error fetching logs.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}

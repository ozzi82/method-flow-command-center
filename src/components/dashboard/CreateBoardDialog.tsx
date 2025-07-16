import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const boardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  description: z.string().optional(),
  color: z.enum(['blue', 'green', 'purple', 'red', 'yellow', 'gray']),
});

type BoardFormData = z.infer<typeof boardSchema>;

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBoard: (name: string, description: string, color: string) => void;
}

export function CreateBoardDialog({ open, onOpenChange, onCreateBoard }: CreateBoardDialogProps) {
  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: '',
      description: '',
      color: 'blue',
    },
  });

  const onSubmit = (data: BoardFormData) => {
    onCreateBoard(data.name, data.description || '', data.color);
    form.reset();
    onOpenChange(false);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Add a new board to organize your tasks.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter board name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add board description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${getColorClass(field.value)}`} />
                          <SelectValue placeholder="Select color" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['blue', 'green', 'purple', 'red', 'yellow', 'gray'].map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${getColorClass(color)}`} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Board
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
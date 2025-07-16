import { Board } from '@/types/board';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';

interface BoardSelectorProps {
  boards: Board[];
  currentBoardId: string;
  onBoardChange: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function BoardSelector({ boards, currentBoardId, onBoardChange, onDeleteBoard }: BoardSelectorProps) {
  const currentBoard = boards.find(b => b.id === currentBoardId);

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
    <div className="flex items-center gap-2">
      <Select value={currentBoardId} onValueChange={onBoardChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getColorClass(currentBoard?.color || 'gray')}`} />
            <SelectValue placeholder="Select board" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getColorClass(board.color)}`} />
                <span>{board.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {boards.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => onDeleteBoard(currentBoardId)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker = ({
  label,
  date,
  onSelect,
  placeholder = "Seleccionar fecha",
  className,
}: DatePickerProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-[#798283]">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white",
              "border-[#798283]/30 hover:bg-[#EFF4F9] hover:border-[#798283]/50",
              "transition-colors duration-200 rounded-lg",
              !date && "text-[#798283]/60"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#798283]/70" />
            {date ? (
              <span className="text-[#798283]">
                {format(date, "PPP", { locale: es })}
              </span>
            ) : (
              <span className="text-[#798283]/70">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-[#798283]/20 shadow-lg rounded-xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            locale={es}
            className="bg-white rounded-xl"
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-[#798283]",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                "border border-[#798283]/20 rounded-md",
                "hover:bg-[#EFF4F9] transition-colors"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: cn(
                "text-[#798283]/70 rounded-md w-9 font-normal text-[0.8rem]",
                "flex items-center justify-center h-8"
              ),
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "h-9 w-9"
              ),
              day: cn(
                "h-9 w-9 p-0 font-normal rounded-md",
                "hover:bg-[#EFF4F9] hover:text-[#798283]",
                "transition-colors duration-200",
                "aria-selected:opacity-100"
              ),
              day_selected: cn(
                "bg-[#D42B22] text-white hover:bg-[#B3251E] hover:text-white",
                "focus:bg-[#D42B22] focus:text-white"
              ),
              day_today:
                "bg-[#EFF4F9] text-[#798283] border border-[#798283]/20",
              day_outside: "text-[#798283]/40",
              day_disabled: "text-[#798283]/30",
              day_range_middle:
                "aria-selected:bg-[#EFF4F9] aria-selected:text-[#798283]",
              day_hidden: "invisible",
            }}
            formatters={{
              formatCaption: (date) => {
                return format(date, "MMMM yyyy", { locale: es });
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

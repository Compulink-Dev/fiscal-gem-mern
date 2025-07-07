import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CalendarEvent {
  id?: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
  description?: string;
}

interface CalendarEventFormProps {
  selectedDate: Date;
  onSubmit: (event: CalendarEvent) => void;
}

export function CalendarEventForm({
  selectedDate,
  onSubmit,
}: CalendarEventFormProps) {
  const [event, setEvent] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    date: selectedDate,
    startTime: "09:00",
    endTime: "10:00",
    color: "blue",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...event,
      id: Math.random().toString(36).substring(2, 9),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add New Event</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={format(event.date, "yyyy-MM-dd")}
              onChange={(e) =>
                setEvent({ ...event, date: new Date(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Select
              value={event.color}
              onValueChange={(value) => setEvent({ ...event, color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={event.startTime}
              onChange={(e) =>
                setEvent({ ...event, startTime: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={event.endTime}
              onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Save Event</Button>
        </div>
      </form>
    </div>
  );
}

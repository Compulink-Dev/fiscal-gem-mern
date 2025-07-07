import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CalendarEventForm,
  type CalendarEvent,
} from "@/components/dashboard/CalenderEventForm";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sample events - in a real app, these would come from an API
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Team Meeting",
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        color: "blue",
        description: "Weekly team sync",
      },
      {
        id: "2",
        title: "Client Call",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        startTime: "14:00",
        endTime: "15:00",
        color: "green",
        description: "Discuss project requirements",
      },
    ];
    setEvents(sampleEvents);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const addEvent = (newEvent: CalendarEvent) => {
    setEvents([...events, newEvent]);
    setIsDialogOpen(false);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <CalendarEventForm
                    selectedDate={selectedDate || new Date()}
                    onSubmit={addEvent}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before the start of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div
                  key={`empty-start-${index}`}
                  className="h-24 border rounded-md bg-gray-50"
                />
              ))}

              {/* Days of the month */}
              {monthDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={day.toString()}
                    className={`h-24 border rounded-md p-1 overflow-y-auto ${
                      isCurrentMonth ? "bg-white" : "bg-gray-50"
                    } ${isToday ? "border-primary border-2" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div
                      className={`text-right text-sm p-1 ${
                        isToday ? "font-bold" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border ${getColorClass(
                            event.color
                          )} truncate`}
                        >
                          {event.startTime} {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Empty cells for days after the end of the month */}
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div
                  key={`empty-end-${index}`}
                  className="h-24 border rounded-md bg-gray-50"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getEventsForDay(selectedDate).length > 0 ? (
                getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getColorClass(
                      event.color
                    )}`}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm">
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.description && (
                      <div className="text-sm mt-1">{event.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  No events scheduled for this day
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  class: {
    name: string;
  };
  subject: {
    name: string;
  };
}

const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const dayLabels: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

export default function MySchedulePage() {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedules?mySchedules=true", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setSchedules(data.data);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Group by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort each day's schedules by start time
  Object.keys(schedulesByDay).forEach((day) => {
    schedulesByDay[day].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Jadwal Mengajar Saya
        </h1>
        <p className="text-muted-foreground">
          Total {schedules.length} jadwal mengajar minggu ini
        </p>
      </div>

      {/* Schedules by Day */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Tidak ada jadwal mengajar
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dayOrder.map((day) => {
            const daySchedules = schedulesByDay[day];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {dayLabels[day]}
                  </CardTitle>
                  <CardDescription>{daySchedules.length} jadwal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm font-medium min-w-[120px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-semibold">{schedule.subject.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {schedule.class.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Badge variant="outline">{schedule.room}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

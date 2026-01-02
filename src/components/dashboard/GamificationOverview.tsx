"use client";

import * as React from "react";
import {
  Trophy,
  Star,
  Flame,
  CalendarCheck,
  Sunrise,
  BookOpen,
  Medal,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface GamificationProfile {
  xp: number;
  level: number;
  points: number;
  streakDays: number;
  badges: {
    obtainedAt: string;
    badge: {
      code: string;
      name: string;
      description: string;
      icon: string;
      xpValue: number;
    }
  }[];
}

const iconMap: Record<string, React.ElementType> = {
  "Sunrise": Sunrise,
  "CalendarCheck": CalendarCheck,
  "Flame": Flame,
  "BookOpen": BookOpen,
  "default": Medal
};

export function GamificationOverview() {
  const [data, setData] = React.useState<GamificationProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/gamification/me")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(err => console.error("Failed to load gamification", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="border-indigo-100 bg-indigo-50/50">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Level Logic
  const currentXP = data.xp;
  const nextLevelXP = data.level * 100 + (data.level * 50); // Example curve
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Trophy className="h-32 w-32 text-indigo-500 transform rotate-12" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-950">
              <Trophy className="h-5 w-5 text-amber-500" />
              Level {data.level}
            </CardTitle>
            <CardDescription>
              {data.points} Poin Reward
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              <Flame className="h-4 w-4 fill-amber-500" />
              {data.streakDays} Hari Streak
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>{currentXP} XP</span>
            <span>{nextLevelXP} XP (Next Level)</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-indigo-100 [&>div]:bg-indigo-600" />
        </div>

        {/* Badges */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            Lencana Saya ({data.badges.length})
          </h4>

          {data.badges.length === 0 ? (
            <div className="text-center py-4 bg-white/50 rounded-lg border border-dashed text-sm text-muted-foreground">
              Belum ada lencana yang diraih. Rajin absen yuk!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {data.badges.map((userBadge, i) => {
                  const Icon = iconMap[userBadge.badge.icon] || iconMap["default"];
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="h-12 w-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm cursor-help hover:scale-110 transition-transform hover:border-indigo-300">
                          <Icon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{userBadge.badge.name}</p>
                        <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px] h-5">+{userBadge.badge.xpValue} XP</Badge>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

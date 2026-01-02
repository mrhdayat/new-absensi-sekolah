"use client";

import * as React from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  className: string;
  level: number;
  xp: number;
  title: string;
  points: number;
  badgesCount: number;
}

export function Leaderboard() {
  const [data, setData] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/gamification/leaderboard")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(err => console.error("Failed to load leaderboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="border-indigo-100 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-950">
          <Crown className="h-5 w-5 text-amber-500" />
          Papan Peringkat (Top 10)
        </CardTitle>
        <CardDescription>Siswa paling rajin dan berprestasi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${entry.rank === 1 ? "bg-amber-50 border border-amber-100" :
                  entry.rank <= 3 ? "bg-indigo-50/50" : "hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-bold
                  ${entry.rank === 1 ? "bg-amber-100 text-amber-600" :
                    entry.rank === 2 ? "bg-slate-200 text-slate-600" :
                      entry.rank === 3 ? "bg-orange-100 text-orange-600" :
                        "text-slate-400"}
                `}>
                  {entry.rank <= 3 ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <span className="text-sm">#{entry.rank}</span>
                  )}
                </div>

                <Avatar className="h-10 w-10 border border-white shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}`} />
                  <AvatarFallback>{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {entry.name}
                    {entry.rank === 1 && <Crown className="h-3 w-3 text-amber-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="h-4 px-1 py-0 text-[10px]">{entry.title}</Badge>
                    <span>• {entry.className}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-indigo-600">Lvl {entry.level}</div>
                <div className="text-xs text-muted-foreground">{entry.points} Pts</div>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada data peringkat.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

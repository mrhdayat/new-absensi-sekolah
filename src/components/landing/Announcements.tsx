"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AnnouncementsProps {
  announcements: any[];
}

export function Announcements({ announcements }: AnnouncementsProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <section className="py-20 relative z-10">
      <div className="container px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600">
            <Bell className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold">Pengumuman Terbaru</h2>
        </div>

        <div className="grid gap-4">
          {announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card border border-border/50 rounded-xl p-6 hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
              <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-muted rounded-lg w-16 h-16 text-center">
                <span className="text-xs uppercase font-bold text-muted-foreground">
                  {format(new Date(item.startDate), "MMM", { locale: id })}
                </span>
                <span className="text-xl font-bold">
                  {format(new Date(item.startDate), "dd", { locale: id })}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.type === "ALERT" && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      Penting
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2 md:line-clamp-1">
                  {item.content}
                </p>
              </div>

              <button className="shrink-0 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                Baca Selengkapnya <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

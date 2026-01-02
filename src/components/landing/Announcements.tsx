"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AnnouncementsProps {
  announcements: any[];
}

export function Announcements({ announcements }: AnnouncementsProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <section className="py-24 border-t border-white/5 relative z-10 bg-white/[0.01]">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Live Updates</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">Pengumuman Sekolah</h2>
          </div>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
            Lihat Semua <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 max-w-4xl mx-auto">
          {announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-xl border border-white/5 bg-[#0F1218] hover:border-white/10 transition-colors"
            >
              {/* Date Badge */}
              <div className="flex-shrink-0 flex md:flex-col items-center gap-2 md:gap-0 min-w-[80px] text-muted-foreground/60 border-r border-white/5 pr-6 mr-2 md:mr-0">
                <span className="text-2xl font-bold text-white/80">{format(new Date(item.startDate), "dd")}</span>
                <span className="text-xs uppercase tracking-wider">{format(new Date(item.startDate), "MMM", { locale: id })}</span>
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  {item.type === 'IMPORTANT' || item.type === 'ALERT' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                      Penting
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                      Info
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/50">{format(new Date(item.startDate), "yyyy")}</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.content || "Klik untuk membaca detail pengumuman ini secara lengkap."}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

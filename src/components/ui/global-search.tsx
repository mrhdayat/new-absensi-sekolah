"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, GraduationCap, School, Calendar, Command } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  id: string;
  type: "student" | "teacher" | "class" | "schedule" | "subject";
  title: string;
  subtitle: string;
  url: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Cmd+K or Ctrl+K to open
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search on query change
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "student":
        return <GraduationCap className="h-4 w-4" />;
      case "teacher":
        return <Users className="h-4 w-4" />;
      case "class":
        return <School className="h-4 w-4" />;
      case "schedule":
        return <Calendar className="h-4 w-4" />;
      case "subject":
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      student: "Siswa",
      teacher: "Guru",
      class: "Kelas",
      schedule: "Jadwal",
      subject: "Mata Pelajaran",
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 w-full max-w-md px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-md border hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Cari data...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          <DialogTitle className="sr-only">Pencarian Global</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari siswa, guru, kelas, jadwal..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                      }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Tidak ada hasil ditemukan</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Ketik minimal 2 karakter untuk mencari</p>
                <p className="text-xs mt-2">
                  Tekan <kbd className="px-1.5 py-0.5 rounded bg-muted">↑</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted">↓</kbd> untuk navigasi
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

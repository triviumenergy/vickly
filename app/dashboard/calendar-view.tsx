"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = {
  id: string;
  entry_date: string;
  duration_minutes: number;
  project_id: string;
};

type Project = { id: string; name: string };

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function minutesToLabel(minutes: number) {
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CalendarView({
  allProjects,
}: {
  allProjects: Project[];
}) {
  const supabase = createClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadMonth() {
      setLoading(true);
      const monthStart = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const monthEnd = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

      const { data } = await supabase
        .from("time_entries")
        .select("id, entry_date, duration_minutes, project_id")
        .gte("entry_date", monthStart)
        .lte("entry_date", monthEnd);

      setEntries(data ?? []);
      setLoading(false);
      setSelectedDate(null);
    }

    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const minutesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      map[e.entry_date] = (map[e.entry_date] ?? 0) + e.duration_minutes;
    });
    return map;
  }, [entries]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    // Lunes = 0 ... Domingo = 6
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < startOffset; i++) {
      result.push({ date: null, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: `${year}-${pad(month + 1)}-${pad(d)}`, day: d });
    }
    return result;
  }, [year, month]);

  function goPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function projectName(id: string) {
    return allProjects.find((p) => p.id === id)?.name ?? "—";
  }

  const selectedEntries = selectedDate
    ? entries.filter((e) => e.entry_date === selectedDate)
    : [];

  const maxMinutes = Math.max(1, ...Object.values(minutesByDay));

  return (
    <div className="bg-panel border border-line rounded p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goPrevMonth}
            className="w-8 h-8 border border-line rounded hover:bg-cream transition-colors"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <button
            onClick={goNextMonth}
            className="w-8 h-8 border border-line rounded hover:bg-cream transition-colors"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-soft font-medium mb-2">
        {DAY_LABELS.map((label, i) => (
          <div key={i}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;

          const mins = minutesByDay[cell.date] ?? 0;
          const intensity = mins > 0 ? Math.max(0.15, mins / maxMinutes) : 0;
          const isSelected = selectedDate === cell.date;

          return (
            <button
              key={cell.date}
              onClick={() => setSelectedDate(isSelected ? null : cell.date)}
              className={`aspect-square rounded flex flex-col items-center justify-center text-xs border transition-colors ${
                isSelected ? "border-teal-dark" : "border-transparent"
              }`}
              style={{
                backgroundColor:
                  mins > 0
                    ? `rgba(39, 177, 191, ${intensity})`
                    : "var(--bg)",
              }}
            >
              <span
                className={mins > 0.6 * maxMinutes ? "text-white" : ""}
              >
                {cell.day}
              </span>
              {mins > 0 && (
                <span
                  className={`text-[10px] font-medium ${
                    mins > 0.6 * maxMinutes ? "text-white" : "text-teal-dark"
                  }`}
                >
                  {minutesToLabel(mins)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-xs text-ink-soft mt-4">Cargando...</p>
      )}

      {selectedDate && selectedEntries.length > 0 && (
        <div className="mt-5 pt-4 border-t border-line">
          <p className="text-sm font-medium mb-2">
            {selectedDate.split("-").reverse().join("/")}
          </p>
          {selectedEntries.map((e) => (
            <div
              key={e.id}
              className="flex justify-between text-sm text-ink-soft py-1"
            >
              <span>{projectName(e.project_id)}</span>
              <span>{minutesToLabel(e.duration_minutes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CheckIn } from "@/lib/types";
import { formatWeekLabel } from "@/lib/utils";

type Props = {
  checkIns: CheckIn[];
};

export function ProgressCharts({ checkIns }: Props) {
  const chronological = [...checkIns].sort((a, b) =>
    a.weekOf.localeCompare(b.weekOf)
  );

  const weightData = chronological.map((c) => ({
    week: formatWeekLabel(c.weekOf),
    weight: c.bodyWeightLbs,
  }));

  const squatData = chronological
    .filter((c) => c.squatEst1rm != null)
    .map((c) => ({
      week: formatWeekLabel(c.weekOf),
      squat: c.squatEst1rm as number,
    }));

  if (weightData.length < 2) {
    return (
      <p className="border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-ink-muted">
        Need at least two check-ins to chart progress.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Body weight">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weightData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#d5dae0" strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tick={{ fill: "#5c6570", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#d5dae0" }}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fill: "#5c6570", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#d5dae0" }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #d5dae0",
                borderRadius: 0,
                background: "#fff",
                fontSize: 12,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              name="lb"
              stroke="#ff4d00"
              strokeWidth={2}
              dot={{ r: 3, fill: "#ff4d00" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Est. squat 1RM">
        {squatData.length < 2 ? (
          <p className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-ink-muted">
            Need at least two squat estimates to chart strength.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={squatData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#d5dae0" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fill: "#5c6570", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#d5dae0" }}
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fill: "#5c6570", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#d5dae0" }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #d5dae0",
                  borderRadius: 0,
                  background: "#fff",
                  fontSize: 12,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="squat"
                name="lb"
                stroke="#111418"
                strokeWidth={2}
                dot={{ r: 3, fill: "#111418" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-surface p-4 sm:p-5">
      <h3 className="mb-3 font-display text-base font-semibold tracking-tight">
        {title}
      </h3>
      {children}
    </div>
  );
}

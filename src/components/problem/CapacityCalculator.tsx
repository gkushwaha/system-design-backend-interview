import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import type { CapacityData } from "@/data/problemContent/types";

export function CapacityCalculator({ data }: { data: CapacityData }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(data.inputs.map((i) => [i.key, i.default])),
  );

  const outputs = data.compute(values);
  const chart = data.chartData(values);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Adjust assumptions</div>
        <div className="space-y-4">
          {data.inputs.map((input) => (
            <div key={input.key}>
              <div className="mb-1 flex items-center justify-between text-xs text-muted">
                <span>{input.label}</span>
                <span className="font-mono text-text">
                  {values[input.key].toLocaleString()} {input.unit}
                </span>
              </div>
              <input
                type="range"
                min={input.min}
                max={input.max}
                step={input.step}
                value={values[input.key]}
                onChange={(e) => setValues((v) => ({ ...v, [input.key]: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {outputs.map((o) => (
          <Card key={o.label} className="text-center">
            <div className="font-mono text-lg font-semibold text-indigo-300">{o.value}</div>
            <div className="mt-1 text-xs text-muted">{o.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-2 text-sm font-semibold text-text">Breakdown</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chart}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={11} />
            <YAxis stroke="var(--color-muted)" fontSize={11} unit={data.chartUnit} />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Bar dataKey="value" fill="#6366f1" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

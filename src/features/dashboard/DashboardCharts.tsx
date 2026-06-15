import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/currency";

// recharts-backed chart bodies, split into their own chunk and lazy-loaded by
// DashboardPage so the heavy charting library no longer ships with the
// dashboard's initial render. The surrounding cards/headers/empty-states stay
// in DashboardPage; only the chart canvases live here.

interface SalesPoint {
  date: string;
  total: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface HourPoint {
  hour: string;
  total: number;
}

interface PaymentSlice {
  method: string;
  total: number;
}

const TOOLTIP_CONTENT_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--card-foreground)",
} as const;

const TOOLTIP_LABEL_STYLE = { color: "var(--card-foreground)" } as const;

const compactAxis = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);

// recharts' ResponsiveContainer defaults to a {-1,-1} size for its first render
// (before the ResizeObserver measures), which logs a "width(-1)/height(-1)"
// dev warning. Seeding a positive initial size (height matches the h-64 wrapper)
// avoids that first invalid frame; the observer then corrects the real width.
const INITIAL_DIMENSION = { width: 300, height: 256 };

export function SalesBarChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={INITIAL_DIMENSION}
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={compactAxis}
        />
        <Tooltip
          cursor={{ className: "fill-muted/40" }}
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
        />
        <Bar dataKey="total" fill="#d4a847" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopProductsBarChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={INITIAL_DIMENSION}
    >
      <BarChart
        data={data.map((p, i, arr) => ({
          ...p,
          fillOpacity: 1 - (i / Math.max(arr.length, 1)) * 0.55,
        }))}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          className="stroke-muted"
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ className: "fill-muted/40" }}
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value, _name, item) => [
            `${value} und. · ${formatCurrency(Number(item.payload.total))}`,
            "Vendidos",
          ]}
        />
        <Bar dataKey="quantity" fill="#d4a847" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SalesByHourAreaChart({ data }: { data: HourPoint[] }) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={INITIAL_DIMENSION}
    >
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a847" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#d4a847" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-muted"
        />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={compactAxis}
        />
        <Tooltip
          cursor={{ className: "fill-muted/40" }}
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#d4a847"
          strokeWidth={2}
          fill="url(#hourGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PaymentMethodsPieChart({ data }: { data: PaymentSlice[] }) {
  const palette = ["#d4a847", "#c8864a", "#8b6914", "#e8c76a"];
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      initialDimension={INITIAL_DIMENSION}
    >
      <PieChart>
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => formatCurrency(Number(value))}
        />
        <Legend
          verticalAlign="bottom"
          height={24}
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
        />
        <Pie
          data={data}
          dataKey="total"
          nameKey="method"
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

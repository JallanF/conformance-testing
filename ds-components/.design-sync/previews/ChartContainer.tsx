import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from 'sfi-crossings-ds'

// The capture harness never delivers ResizeObserver callbacks, so the vendor
// container's measuring ResponsiveContainer sizes to 0 and renders no chart.
// An outer ResponsiveContainer with fixed numeric dimensions takes recharts'
// static (observer-free) path and provides the size via context; the vendor's
// inner container detects it and passes the chart through unchanged.
const CHART_W = 608
const CHART_H = 342

const volumeData = [
  { month: 'Jan', crossBorder: 186, domestic: 92 },
  { month: 'Feb', crossBorder: 205, domestic: 87 },
  { month: 'Mar', crossBorder: 237, domestic: 110 },
  { month: 'Apr', crossBorder: 214, domestic: 98 },
  { month: 'May', crossBorder: 262, domestic: 121 },
  { month: 'Jun', crossBorder: 291, domestic: 134 },
]

const volumeConfig = {
  crossBorder: { label: 'Cross-border', color: 'var(--chart-1)' },
  domestic: { label: 'Domestic', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function MonthlyShipmentVolume() {
  return (
    <div style={{ width: CHART_W }}>
      <ResponsiveContainer width={CHART_W} height={CHART_H}>
        <ChartContainer config={volumeConfig}>
          <BarChart accessibilityLayer data={volumeData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            {/* ChartLegend does not render under the fixed-size (observer-free)
                path — omitted here; see NOTES.md */}
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="crossBorder"
              fill="var(--color-crossBorder)"
              radius={4}
              isAnimationActive={false}
            />
            <Bar
              dataKey="domestic"
              fill="var(--color-domestic)"
              radius={4}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  )
}

const waitData = [
  { month: 'Jan', wait: 42 },
  { month: 'Feb', wait: 38 },
  { month: 'Mar', wait: 51 },
  { month: 'Apr', wait: 33 },
  { month: 'May', wait: 29 },
  { month: 'Jun', wait: 31 },
]

const waitConfig = {
  wait: { label: 'Avg border wait (min)', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function AverageBorderWait() {
  return (
    <div style={{ width: CHART_W }}>
      <ResponsiveContainer width={CHART_W} height={CHART_H}>
        <ChartContainer config={waitConfig}>
          <LineChart accessibilityLayer data={waitData} margin={{ left: 4, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis width={28} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="wait"
              type="monotone"
              stroke="var(--color-wait)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-wait)' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  )
}

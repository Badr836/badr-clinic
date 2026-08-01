import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#3a7d7b', '#569896', '#82b6b3', '#c07830', '#b3403a', '#5b6b74']

export default function CasesByAsaChart({ data }: { data: { asa: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="asa" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number, _n, p) => [`${v} cases`, `ASA ${p.payload.asa}`]} />
        <Legend formatter={(v) => `ASA ${v}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

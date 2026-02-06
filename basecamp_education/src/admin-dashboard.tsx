import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Users, BookOpen, ShieldCheck, Activity } from "lucide-react"

interface TutorSetting {
    id: string
    gps_lat: number
    gps_long: number
    radius_meters: number
    trust_score: number
}

function StatsCard({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) {
    return (
        <div className={`p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center space-x-4`}>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-100', '-600')}`} />
            </div>
            <div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}

export function AdminDashboard() {
    const [tutors, setTutors] = useState<TutorSetting[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchTutors() {
            try {
                const { data, error } = await supabase
                    .from('tutor_settings')
                    .select('*')

                if (error) throw error
                setTutors(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTutors()
    }, [])

    const getTrustScoreBadge = (score: number) => {
        if (score >= 100) {
            return (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-3 py-1 text-sm font-semibold rounded-lg shadow-sm">
                    Elite
                </Badge>
            )
        } else if (score < 50) {
            return (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 px-3 py-1 text-sm font-semibold rounded-lg shadow-sm">
                    Probation
                </Badge>
            )
        } else {
            return (
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0 px-3 py-1 text-sm font-semibold rounded-lg shadow-sm">
                    Standard
                </Badge>
            )
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <Activity className="w-10 h-10 text-slate-300 mb-4 animate-bounce" />
                <div className="text-slate-400 font-medium tracking-wide">LOADING BASECAMP BRAIN...</div>
            </div>
        </div>
    )

    if (error) return <div className="p-8 text-red-500 font-bold text-center bg-red-50 rounded-xl m-8">Error: {error}</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        BaseCamp <span className="font-light text-slate-500">Control Center</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time governance dashboard</p>
                </div>
                <Badge variant="outline" className="w-fit text-green-600 border-green-200 bg-green-50 px-4 py-1.5 rounded-full flex gap-2 items-center">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    SYSTEM HEALTHY
                </Badge>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={Users}
                    label="On Field"
                    value={tutors.length.toString()}
                    colorClass="bg-blue-100"
                />
                <StatsCard
                    icon={BookOpen}
                    label="Scheduled Class"
                    value="12"
                    colorClass="bg-purple-100"
                />
                <StatsCard
                    icon={ShieldCheck}
                    label="System Trust"
                    value="98%"
                    colorClass="bg-emerald-100"
                />
            </div>

            {/* Main Glass Panel Table */}
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl border-0 overflow-hidden">
                <CardHeader className="border-b border-gray-100/50">
                    <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Active Tutor Roster
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-gray-100">
                                <TableHead className="w-[350px] font-bold text-xs uppercase tracking-wider text-slate-400 pl-6">ID</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-400">GPS Radius</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-400 text-right pr-6">Trust Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tutors.map((tutor) => (
                                <TableRow key={tutor.id} className="hover:bg-slate-50/50 transition-colors border-b border-gray-50 last:border-0 border-l-4 border-l-transparent hover:border-l-indigo-500">
                                    <TableCell className="font-mono text-xs text-slate-500 pl-6 py-4">
                                        {tutor.id}
                                    </TableCell>
                                    <TableCell className="text-slate-700 font-medium">
                                        {tutor.radius_meters} <span className="text-slate-400 text-xs font-normal">meters</span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        {getTrustScoreBadge(tutor.trust_score)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

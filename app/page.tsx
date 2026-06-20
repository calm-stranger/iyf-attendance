import { createClient } from '@/lib/supabase/server'
import { getOrCreateSession, todayStr } from '@/lib/sessions'
import { LogoutButton } from '@/components/logout-button'
import { AddStudentSheet } from '@/components/add-student-sheet'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { StudentCard } from '@/components/student-card'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const dateStr = params.date || todayStr()

  const session = await getOrCreateSession(dateStr)
  const supabase = await createClient()

  const { data: attendance } = await supabase
    .from('attendance')
    .select('id, students(id, name, dob, address, occupation, photo_url, created_at)')
    .eq('session_id', session.id)
    .order('marked_at', { ascending: false })

  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('id, session_date')
    .order('session_date', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background px-4 py-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <h1 className="text-base font-semibold sm:text-lg">IYF Attendance</h1>
      <Link href="/students" className="text-xs text-primary underline whitespace-nowrap">
        All Students
      </Link>
    </div>
    <LogoutButton />
  </div>
  <div className="mt-1 flex items-center justify-between">
    <p className="text-sm text-muted-foreground">
      {new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </p>
    
    <a  href={`/api/export?date=${dateStr}`}
      className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </a>
  </div>
</header>

      <div className="flex gap-2 overflow-x-auto px-4 py-2">
        {pastSessions?.map((s) => (
          <Link
            key={s.id}
            href={`/?date=${s.session_date}`}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
              s.session_date === dateStr
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border'
            }`}
          >
            {new Date(s.session_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </Link>
        ))}
      </div>

      <main className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">
            Present today ({attendance?.length || 0})
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
  {attendance?.map((a: any) => (
    <StudentCard key={a.id} student={a.students} sessionId={session.id} />
  ))}
</div>
{(!attendance || attendance.length === 0) && (
  <p className="py-8 text-center text-sm text-muted-foreground">
    No one marked present yet. Tap the button below to add someone.
  </p>
)}
      </main>
      <AddStudentSheet sessionId={session.id} />
    </div>
  )
}
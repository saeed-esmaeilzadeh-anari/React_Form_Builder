"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus } from "lucide-react"

interface Collaborator {
  id: string
  name: string
  avatarUrl?: string
}

interface CollaborationPanelProps {
  collaborators: Collaborator[]
  currentUser: { id: string; email?: string } | null
  projectId: string
}

export function CollaborationPanel({ collaborators, currentUser }: CollaborationPanelProps) {
  const [email, setEmail] = useState("")

  const handleInvite = () => {
    if (!email.trim()) return
    // TODO: implement invite logic (Supabase function or API)
    // For now just clear the input
    setEmail("")
    alert(`Invitation sent to ${email}!`)
  }

  return (
    <Card className="h-full flex flex-col bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Collaborators</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Active collaborators list */}
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-3">
            {collaborators.length === 0 ? (
              <p className="text-sm text-gray-500">No collaborators yet.</p>
            ) : (
              collaborators.map((col) => (
                <div key={col.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {col.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={col.avatarUrl || "/placeholder.svg"} alt={col.name} />
                    ) : (
                      <AvatarFallback>
                        {col.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm">{col.name}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Invite form (only if user is logged in) */}
        {currentUser && (
          <div className="mt-4 space-y-2">
            <Input
              type="email"
              placeholder="Invite by email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button size="sm" className="w-full" onClick={handleInvite}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { memo } from 'react'
import { MdiIcon } from '@/components/mdi-icon'
import type { TNote } from '@prisma/client'

interface NoteHeader extends React.HTMLAttributes<HTMLDivElement> {
  note: TNote
}

export const NoteHeader = memo((props: NoteHeader) => {
  const { note, ...rest } = props

  return (
    <header className="flex items-center mb-3 -mt-3" {...rest}>
      <MdiIcon icon={note.icon} size="2.3rem" />
      <span className="font-bold ml-2 text-2xl">{note.name}</span>
    </header>
  )
})

NoteHeader.displayName = 'NoteHeader'

import * as React from 'react'
import { DownloadIcon } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogPortal,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'sfi-crossings-ds'

// Portal trap (see Dialog.tsx): Tooltip does not export its Portal part, so a
// non-modal Dialog portal with `container` provides the parent portal node;
// TooltipContent's internal portal chains to it via Base UI's parent-portal
// context, keeping the tooltip inside the dark-scoped story root.
function DarkPortalScope({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = React.useState<HTMLElement | null>(null)
  return (
    <div ref={setScope}>
      <Dialog defaultOpen modal={false}>
        <DialogPortal container={scope}>{children}</DialogPortal>
      </Dialog>
    </div>
  )
}

export function DownloadWaybillTooltip() {
  return (
    <DarkPortalScope>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120, paddingBottom: 48 }}>
        <TooltipProvider>
          <Tooltip defaultOpen>
            <TooltipTrigger
              render={<Button variant="outline" size="icon" aria-label="Download waybill" />}
            >
              <DownloadIcon />
            </TooltipTrigger>
            <TooltipContent>Download waybill</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </DarkPortalScope>
  )
}

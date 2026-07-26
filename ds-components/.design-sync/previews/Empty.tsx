import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from 'sfi-crossings-ds'
import { PackageIcon, SearchXIcon, TriangleAlertIcon } from 'lucide-react'

// First use: guidance plus a single primary action.
export function FirstUse() {
  return (
    <div style={{ width: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>No shipments yet</EmptyTitle>
          <EmptyDescription>
            Book your first shipment to start tracking crossings, waybills,
            and customs status in one place.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Book shipment</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

// Filtered to nothing: offer the way back out.
export function NoMatches() {
  return (
    <div style={{ width: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>No shipments match your filters</EmptyTitle>
          <EmptyDescription>
            Try widening the date range or clearing the lane filter.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Clear filters</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

// Load failure: say what happened and how to recover.
export function LoadFailed() {
  return (
    <div style={{ width: 420 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>Couldn&rsquo;t load shipments</EmptyTitle>
          <EmptyDescription>
            The tracking service didn&rsquo;t respond. Your data is safe —
            try again in a moment.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Retry</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

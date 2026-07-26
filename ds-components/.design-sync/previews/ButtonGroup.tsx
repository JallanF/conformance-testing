import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from 'sfi-crossings-ds'
import { ChevronDownIcon, TruckIcon } from 'lucide-react'

// Segmented view switcher for the shipments board.
export function ViewSwitcher() {
  return (
    <ButtonGroup>
      <Button variant="outline">List</Button>
      <Button variant="outline">Board</Button>
      <Button variant="outline">Map</Button>
    </ButtonGroup>
  )
}

// Primary split action: dispatch now, or open more dispatch options.
export function SplitAction() {
  return (
    <ButtonGroup>
      <Button>Dispatch SFI-2026-0041</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More dispatch options">
        <ChevronDownIcon />
      </Button>
    </ButtonGroup>
  )
}

// Static text cell prefixed to actions, e.g. the assigned carrier.
export function WithText() {
  return (
    <ButtonGroup>
      <ButtonGroupText>
        <TruckIcon />
        Maple Line Carriers
      </ButtonGroupText>
      <Button variant="outline">Reassign</Button>
      <Button variant="outline">Contact</Button>
    </ButtonGroup>
  )
}

import * as React from 'react'
import {
  Dialog,
  DialogPortal,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from 'sfi-crossings-ds'

// Portal trap (see Tooltip.tsx): the vendor NavigationMenu root renders its
// Positioner through a Base UI Portal, so a non-modal Dialog portal with
// `container` provides the parent portal node, keeping the open panel inside
// the dark-scoped story root.
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

const shipmentLinks = [
  { title: 'Active shipments', desc: '12 en route across 4 lanes' },
  { title: 'Awaiting customs', desc: '3 held at Ambassador Bridge' },
  { title: 'Drafts', desc: '2 unbooked shipments' },
  { title: 'Delivered', desc: 'Last 30 days of history' },
]

// Top navigation bar with the Shipments panel open (defaultValue on the root
// matches the item's value; hover cannot be captured statically).
export function TopNavShipmentsOpen() {
  return (
    <DarkPortalScope>
      <div style={{ paddingTop: 16, paddingLeft: 16 }}>
        <NavigationMenu defaultValue="shipments">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem value="shipments">
              <NavigationMenuTrigger>Shipments</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    width: 460,
                  }}
                >
                  {shipmentLinks.map((link) => (
                    <NavigationMenuLink key={link.title} href="#">
                      <div>
                        <div style={{ fontWeight: 500 }}>{link.title}</div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--muted-foreground)',
                            marginTop: 2,
                          }}
                        >
                          {link.desc}
                        </div>
                      </div>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                Customs
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                Carriers
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </DarkPortalScope>
  )
}

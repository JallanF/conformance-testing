import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'sfi-crossings-ds'

export function ShipmentSections() {
  return (
    <div style={{ maxWidth: 560, width: '100%' }}>
      <Accordion defaultValue={['customs']}>
        <AccordionItem value="details">
          <AccordionTrigger>Shipment details</AccordionTrigger>
          <AccordionContent>
            <p>
              SFI-2026-0041 · Toronto → Detroit. Dry van, 1,240 kg on 4
              pallets. Departed Jul 22, 06:10 EDT; ETA Jul 24, 14:00 EDT.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="customs">
          <AccordionTrigger>Customs &amp; documentation</AccordionTrigger>
          <AccordionContent>
            <p>
              Cleared for the Ambassador Bridge crossing under PARS
              #7364-2201. Broker: Great Lakes Customs Ltd.
            </p>
            <p>
              Commercial invoice, bill of lading, and certificate of origin
              are on file. The packing list was amended Jul 21 to reflect the
              revised pallet count.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="route">
          <AccordionTrigger>Route &amp; stops</AccordionTrigger>
          <AccordionContent>
            <p>
              Two stops: pickup at Etobicoke terminal, delivery at the Detroit
              consignee dock. No layovers scheduled.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function BookingFaq() {
  return (
    <div style={{ maxWidth: 560, width: '100%' }}>
      <Accordion defaultValue={['cutoff']}>
        <AccordionItem value="cutoff">
          <AccordionTrigger>When is the booking cutoff for next-day pickup?</AccordionTrigger>
          <AccordionContent>
            <p>
              Bookings confirmed before 16:00 local time are eligible for
              next-day pickup at any Ontario or Michigan terminal. Later
              bookings roll to the following business day.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="docs">
          <AccordionTrigger>Which documents do I need for a CA → US crossing?</AccordionTrigger>
          <AccordionContent>
            <p>
              A commercial invoice, bill of lading, and certificate of origin
              are required before the waybill can be issued.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="hazmat">
          <AccordionTrigger>Do you carry hazardous materials?</AccordionTrigger>
          <AccordionContent>
            <p>
              Class 3 and Class 9 only, with 48 hours advance notice and an
              approved emergency contact on the booking.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

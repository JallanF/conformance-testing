import { Progress, ProgressLabel, ProgressValue } from 'sfi-crossings-ds'

// A determinate document upload in a shipment record.
export function DocumentUpload() {
  return (
    <div style={{ width: 360 }}>
      <Progress value={68}>
        <ProgressLabel>Uploading commercial invoice</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}

// A batch of customs documents at different stages of upload.
export function UploadQueue() {
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Progress value={100}>
        <ProgressLabel>Bill of lading</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={45}>
        <ProgressLabel>Certificate of origin</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={10}>
        <ProgressLabel>Packing list</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}

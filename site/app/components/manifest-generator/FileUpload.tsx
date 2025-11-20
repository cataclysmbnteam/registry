/// <reference lib="dom" />
/**
 * File upload section for importing modinfo.json files.
 */

interface FileUploadProps {
  onFileUpload: (e: Event) => void
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => (
  <section>
    <h3>Or Upload modinfo.json</h3>
    <input type="file" accept=".json" onChange={onFileUpload} />
  </section>
)

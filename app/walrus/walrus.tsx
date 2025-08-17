"use client";

import { useMemo, useRef, useState } from "react";
import { uploadBlob, downloadBlob } from "../blockchain-utils";

export default function WalrusPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [epochs, setEpochs] = useState<string>("");
  const [sendObjectTo, setSendObjectTo] = useState<string>("");
  const [deletable, setDeletable] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<unknown>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [blobId, setBlobId] = useState<string>("");
  const [downloadFilename, setDownloadFilename] = useState<string>("walrus-blob");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadInfo, setDownloadInfo] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadedUrl, setDownloadedUrl] = useState<string | null>(null);
  const [downloadedSize, setDownloadedSize] = useState<number | null>(null);
  const [downloadPreview, setDownloadPreview] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  const contentTypeHint = useMemo(() => selectedFile?.type || "", [selectedFile]);

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setDownloadedUrl(null);
    setDownloadedSize(null);
    setDownloadPreview(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const parsedEpochs = epochs.trim() === "" ? undefined : Number(epochs);
      const res = await uploadBlob(
        selectedFile,
        typeof parsedEpochs === "number" && !Number.isNaN(parsedEpochs) ? parsedEpochs : undefined,
        sendObjectTo.trim() || undefined,
        deletable,
        selectedFile.type || undefined
      );
      setUploadResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload() {
    if (!blobId.trim()) return;
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadInfo(null);
    revokeObjectUrl();
    try {
      const data = await downloadBlob(blobId.trim());
      const blob = new Blob([data], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      // Store for output area
      setDownloadedUrl(url);
      setDownloadedSize(data.byteLength);

      // Best-effort text preview for small payloads
      try {
        const MAX_PREVIEW = 64 * 1024; // 64KB
        const slice = data.byteLength > MAX_PREVIEW ? data.slice(0, MAX_PREVIEW) : data;
        const text = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(slice));
        // Trim very long previews
        setDownloadPreview(text.length > MAX_PREVIEW ? text.slice(0, MAX_PREVIEW) : text);
      } catch {
        setDownloadPreview(null);
      }

      // Trigger browser download immediately
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename && downloadFilename.trim() ? downloadFilename.trim() : "walrus-blob";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadInfo(`Downloaded ${data.byteLength} bytes`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  }

  function handleDownloadFileAgain() {
    if (!downloadedUrl) return;
    const a = document.createElement("a");
    a.href = downloadedUrl;
    a.download = downloadFilename && downloadFilename.trim() ? downloadFilename.trim() : "walrus-blob";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Walrus Blob Tester</h1>
        <p className="mt-1 text-sm text-gray-600">Upload a blob to Walrus and download by Blob ID.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Upload</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
                onChange={(e) => setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
              {contentTypeHint ? (
                <p className="mt-1 text-xs text-gray-500">Detected content-type: {contentTypeHint}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Epochs (optional)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={epochs}
                  onChange={(e) => setEpochs(e.target.value)}
                  placeholder="e.g. 10"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Send Object To (optional)</label>
                <input
                  type="text"
                  value={sendObjectTo}
                  onChange={(e) => setSendObjectTo(e.target.value)}
                  placeholder="account address or URL"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="deletable"
                type="checkbox"
                checked={deletable}
                onChange={(e) => setDeletable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <label htmlFor="deletable" className="text-sm text-gray-700">
                Deletable
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 ${
                  !selectedFile || isUploading
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200"
                    : "bg-brand-600 text-white ring-brand-600 shadow-theme-sm hover:bg-brand-700"
                }`}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {uploadError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>
            ) : null}

            {uploadResult != null ? (
              <div>
                <div className="mb-1 text-sm font-medium text-gray-800">Upload result</div>
                <pre className="max-h-60 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
{JSON.stringify(uploadResult, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </div>

        {/* Download Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Download</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blob ID</label>
              <input
                type="text"
                value={blobId}
                onChange={(e) => setBlobId(e.target.value)}
                placeholder="Enter blob ID"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filename</label>
              <input
                type="text"
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                placeholder="walrus-blob"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownload}
                disabled={!blobId || isDownloading}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 ring-inset transition ${
                  !blobId || isDownloading
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200"
                    : "bg-brand-600 text-white ring-brand-600 shadow-theme-sm hover:bg-brand-700"
                }`}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>

            {downloadedUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <a
                    href={downloadedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-50"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={handleDownloadFileAgain}
                    className="inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-brand-600 hover:bg-brand-700"
                  >
                    Download file
                  </button>
                  {typeof downloadedSize === "number" ? (
                    <span className="text-xs text-gray-600">{downloadedSize} bytes</span>
                  ) : null}
                </div>
                {downloadPreview ? (
                  <div>
                    <div className="mb-1 text-sm font-medium text-gray-800">Preview</div>
                    <pre className="max-h-60 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">{downloadPreview}</pre>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Preview unavailable. Use the buttons above to open or save the file.</p>
                )}
              </div>
            ) : null}

            {downloadError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{downloadError}</div>
            ) : null}

            {downloadInfo ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{downloadInfo}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cleanup object URLs on unmount */}
      <Cleanup onCleanup={revokeObjectUrl} />
    </div>
  );
}

function Cleanup({ onCleanup }: { onCleanup: () => void }) {
  // Minimal effect component to run cleanup on unmount without adding dependencies to the main component
  useMemo(() => {
    return () => {
      onCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
} 
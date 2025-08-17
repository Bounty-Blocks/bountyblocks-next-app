export const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
export const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

function buildBaseUrl(baseUrl: string): string {
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUploadQuery(epochs?: number, sendObjectTo?: string, deletable?: boolean): string {
	const params = new URLSearchParams();
	if (typeof epochs === "number") params.set("epochs", String(epochs));
	if (sendObjectTo) params.set("send_object_to", sendObjectTo);
	if (deletable === true) params.set("deletable", "true");
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

async function parseResponse(res: Response): Promise<unknown> {
	const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
	try {
		if (contentType.includes("application/json")) return await res.json();
		return await res.text();
	} catch {
		return null;
	}
}

export type BinaryLike =
	| Blob
	| File
	| ArrayBuffer
	| Uint8Array
	| Buffer
	| ReadableStream<Uint8Array>;

/**
 * Upload a blob to the Walrus publisher.
 * Inline params only (no options object).
 */
export async function uploadBlob(
	data: BodyInit | string,
	epochs?: number,
	sendObjectTo?: string,
	deletable?: boolean,
	contentType?: string
): Promise<unknown> {
	const base = buildBaseUrl(PUBLISHER);
	const url = `${base}/v1/blobs${buildUploadQuery(epochs, sendObjectTo, deletable)}`;

	const headers = new Headers();
	if (typeof data === "string") {
		headers.set("content-type", contentType ?? "text/plain; charset=utf-8");
	} else if (contentType) {
		headers.set("content-type", contentType);
	}

	const res = await fetch(url, {
		method: "PUT",
		body: data as BodyInit,
		headers,
	});

	if (!res.ok) {
		const errBody = await parseResponse(res);
		const message = typeof errBody === "string" ? errBody : JSON.stringify(errBody);
		throw new Error(`Blob publish failed (${res.status} ${res.statusText}): ${message}`);
	}

	return parseResponse(res);
}

/**
 * Download a blob from the Walrus aggregator.
 * Inline params only (no options object). Returns ArrayBuffer.
 */
export async function downloadBlob(
	blobId: string,
): Promise<ArrayBuffer> {
	const base = buildBaseUrl(AGGREGATOR);
	const url = `${base}/v1/blobs/${encodeURIComponent(blobId)}`;
	const headers = new Headers();

	const res = await fetch(url, { headers });
	if (!res.ok) {
		const message = await res.text().catch(() => "");
		throw new Error(`Blob download failed (${res.status} ${res.statusText}): ${message}`);
	}
	return await res.arrayBuffer();
}

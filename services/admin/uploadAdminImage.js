// services/admin/uploadAdminImage.js

/**
 * Uploads an image blob to our own API route and resolves with the final URL.
 * Uses XMLHttpRequest because fetch() can't report upload progress.
 */
export function uploadAdminImage(blob, { signal, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const abortError = () => new DOMException("Aborted", "AbortError");
    if (signal?.aborted) return reject(abortError());

    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append(
      "file",
      blob,
      blob.type === "image/png" ? "avatar.png" : "avatar.webp",
    );

    xhr.open("POST", "/api/admin/upload-image");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) {
        resolve(data.url);
      } else {
        reject(new Error(data.error || "Upload failed. Please try again."));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Network error. Check your connection and retry."));
    xhr.onabort = () => reject(abortError());

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(body);
  });
}

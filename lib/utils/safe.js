export async function safe(promise, fallback = []) {
  try {
    return await promise;
  } catch (error) {
    console.error("[data]", error?.message ?? error);
    return fallback;
  }
}


import { toPng } from "html-to-image";

export async function downloadShareCard(el: HTMLElement, filename = "1-in-x.png") {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#0a0613",
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function shareUrl(provider: "x" | "facebook" | "whatsapp", text: string, url: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (provider) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`;
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
  }
}

export async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

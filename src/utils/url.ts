import { SUPPORTED_HOSTS } from '../config/platforms';

export function parseAndValidateUrl(raw: string): URL {
  const url = new URL(raw.trim());
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are allowed.');
  }
  const hostname = url.hostname.toLowerCase();
  if (!SUPPORTED_HOSTS.has(hostname)) {
    throw new Error('Unsupported or blocked hostname.');
  }
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    throw new Error('Potential SSRF target blocked.');
  }
  return url;
}

const CODE_REGEX = /K7301[-\s]*([23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6})/i;

export function extractCodeFromContent(content) {
  const match = String(content || "").toUpperCase().match(CODE_REGEX);
  return match ? `K7301-${match[1]}` : null;
}

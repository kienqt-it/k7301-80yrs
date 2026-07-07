const CODE_REGEX = /K7301-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}/i;

export function extractCodeFromContent(content) {
  const match = content.toUpperCase().match(CODE_REGEX);
  return match ? match[0] : null;
}

export const directChatId = (firstUid, secondUid) => [firstUid, secondUid].sort().map(encodeURIComponent).join('%');

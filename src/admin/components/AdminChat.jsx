import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { directChatId } from '../data/directChat.js';
import { getRepository } from '../data/repository.js';
import { formatDateTime, initials, toDate } from '../lib/date.js';
import { Icon } from './Icons.jsx';

const roleName = { teacher: 'Tanár', editor: 'Szerkesztő', author: 'Szerző' };
const allowedRoles = Object.keys(roleName);

function initialPosition() {
  const width = Math.min(390, window.innerWidth - 24);
  const height = Math.min(620, window.innerHeight - 24);
  return {
    x: window.innerWidth <= 640 ? 12 : Math.max(12, window.innerWidth - width - 16),
    y: window.innerWidth <= 640 ? 12 : Math.max(12, window.innerHeight - height - 76),
  };
}

export default function AdminChat({ user }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [members, setMembers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUid, setActiveUid] = useState(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const drag = useRef(null);
  const endOfMessages = useRef(null);
  const previousChats = useRef(null);
  const noticeTimer = useRef(null);

  const activeMember = members.find((member) => member.uid === activeUid);
  const activeChatId = activeUid ? directChatId(user.uid, activeUid) : null;
  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const unreadCount = chats.filter((chat) => chat.unreadFor?.includes(user.uid)).length;

  useEffect(() => {
    setActiveUid(null);
    setError('');
    previousChats.current = null;
  }, [user.uid]);

  useEffect(() => {
    let alive = true;
    getRepository()
      .then((repo) => repo.listMembers({ schoolId: user.schoolId }))
      .then((result) => {
        if (alive) setMembers(result.filter((member) => member.uid !== user.uid && allowedRoles.includes(member.role)));
      })
      .catch((reason) => { if (alive) setError(reason.message || 'A szerkesztőség tagjait nem sikerült betölteni.'); })
      .finally(() => { if (alive) setLoadingMembers(false); });
    return () => { alive = false; };
  }, [user.schoolId, user.uid]);

  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    getRepository()
      .then((repo) => repo.subscribeDirectChats({
        user,
        onData: setChats,
        onError: (reason) => { if (alive) setError(reason.message || 'A beszélgetések nem tölthetők be.'); },
      }))
      .then((stop) => { if (alive) unsubscribe = stop; else stop(); })
      .catch((reason) => { if (alive) setError(reason.message || 'A beszélgetések nem tölthetők be.'); });
    return () => { alive = false; unsubscribe(); };
  }, [user.uid, user.schoolId]);

  useEffect(() => {
    const previous = previousChats.current;
    if (previous) {
      const incoming = chats.find((chat) => chat.lastSenderId !== user.uid
        && chat.unreadFor?.includes(user.uid)
        && previous.get(chat.id) !== chat.lastMessageId);
      if (incoming) {
        const otherUid = incoming.memberIds.find((uid) => uid !== user.uid);
        const member = members.find((item) => item.uid === otherUid);
        setNotice({ uid: otherUid, name: member?.displayName || 'Új üzenet' });
        window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setNotice(null), 7000);
      }
    }
    previousChats.current = new Map(chats.map((chat) => [chat.id, chat.lastMessageId]));
  }, [chats, members, user.uid]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  useEffect(() => {
    if (!activeChatId || !activeChat) {
      setMessages([]);
      return undefined;
    }
    let alive = true;
    let unsubscribe = () => {};
    getRepository()
      .then((repo) => repo.subscribeDirectMessages(activeChatId, {
        onData: setMessages,
        onError: (reason) => { if (alive) setError(reason.message || 'Az üzenetek nem tölthetők be.'); },
      }))
      .then((stop) => { if (alive) unsubscribe = stop; else stop(); })
      .catch((reason) => { if (alive) setError(reason.message || 'Az üzenetek nem tölthetők be.'); });
    return () => { alive = false; unsubscribe(); };
  }, [activeChatId, Boolean(activeChat)]);

  useEffect(() => {
    if (!open || !activeChat?.unreadFor?.includes(user.uid)) return;
    getRepository()
      .then((repo) => repo.markDirectChatRead(activeChat.id, { user }))
      .catch((reason) => setError(reason.message || 'Az olvasottság mentése nem sikerült.'));
  }, [activeChat?.id, activeChat?.unreadFor?.includes(user.uid), open, user.uid, user.schoolId]);

  useEffect(() => {
    if (open && position) endOfMessages.current?.scrollIntoView({ block: 'end' });
  }, [messages, open, position]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    const clamp = () => setPosition((current) => {
      if (!current) return current;
      const width = Math.min(390, window.innerWidth - 24);
      const height = Math.min(620, window.innerHeight - 24);
      return {
        x: Math.min(Math.max(12, current.x), Math.max(12, window.innerWidth - width - 12)),
        y: Math.min(Math.max(12, current.y), Math.max(12, window.innerHeight - height - 12)),
      };
    });
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', clamp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', clamp);
    };
  }, [open]);

  const contacts = useMemo(() => {
    const rank = new Map(chats.map((chat, index) => [chat.memberIds.find((uid) => uid !== user.uid), index]));
    const filtered = members.filter((member) => member.displayName.toLocaleLowerCase('hu').includes(search.trim().toLocaleLowerCase('hu')));
    return filtered.sort((a, b) => {
      const aRank = rank.get(a.uid);
      const bRank = rank.get(b.uid);
      if (aRank !== undefined || bRank !== undefined) return (aRank ?? Infinity) - (bRank ?? Infinity);
      return a.displayName.localeCompare(b.displayName, 'hu');
    });
  }, [chats, members, search, user.uid]);

  const showChat = useCallback((uid) => {
    setActiveUid(uid);
    setError('');
    setNotice(null);
  }, []);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeMember || sending) return;
    setSending(true);
    setError('');
    try {
      const chatId = directChatId(user.uid, activeMember.uid);
      await (await getRepository()).sendDirectMessage(chatId, activeMember.uid, text, { user });
      setDraft('');
    } catch (reason) {
      setError(reason.message || 'Az üzenetet nem sikerült elküldeni.');
    } finally {
      setSending(false);
    }
  };

  const startDrag = (event) => {
    if (event.target.closest('button')) return;
    if (!position) setPosition(initialPosition());
    drag.current = { x: event.clientX, y: event.clientY, position: position || initialPosition() };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    if (!drag.current) return;
    const width = Math.min(390, window.innerWidth - 24);
    const height = Math.min(620, window.innerHeight - 24);
    setPosition({
      x: Math.min(Math.max(12, drag.current.position.x + event.clientX - drag.current.x), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(12, drag.current.position.y + event.clientY - drag.current.y), Math.max(12, window.innerHeight - height - 12)),
    });
  };
  const endDrag = () => { drag.current = null; };

  return (
    <>
      {notice && (
        <div className="fixed bottom-20 right-3 z-[71] w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-line bg-surface p-3 shadow-pop" role="status">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark">{initials(notice.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Új üzenet · {notice.name}</p>
              <button type="button" className="mt-1 text-sm font-medium text-brand hover:underline" onClick={() => { showChat(notice.uid); setOpen(true); setPosition((current) => current || initialPosition()); }}>
                Beszélgetés megnyitása
              </button>
            </div>
            <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-canvas" aria-label="Értesítés bezárása" onClick={() => setNotice(null)}><Icon name="close" size={16} /></button>
          </div>
        </div>
      )}

      {open && position && (
        <section
          className="fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
          style={{ left: position.x, top: position.y, width: 'min(390px, calc(100vw - 24px))', height: 'min(620px, calc(100dvh - 24px))' }}
          aria-label="Szerkesztőségi chat"
        >
          <header
            className="flex min-h-[4.25rem] shrink-0 cursor-move touch-none items-center gap-3 border-b border-line bg-surface px-4"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {activeMember ? (
              <>
                <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-canvas" aria-label="Vissza a beszélgetésekhez" onClick={() => { setActiveUid(null); setError(''); }}>
                  <Icon name="chevronRight" size={20} className="rotate-180" />
                </button>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark">{initials(activeMember.displayName)}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">{activeMember.displayName}</h2>
                  <p className="text-xs text-muted">{roleName[activeMember.role]}</p>
                </div>
              </>
            ) : (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark"><Icon name="chat" size={19} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">Szerkesztőségi chat</h2>
                  <p className="text-xs text-muted">Privát üzenetek a csapatnak</p>
                </div>
              </>
            )}
            <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-canvas" aria-label="Chat bezárása" onClick={() => setOpen(false)}><Icon name="close" size={18} /></button>
          </header>

          {error && <p className="mx-3 mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-ink" role="alert">{error}</p>}

          {activeMember ? (
            <>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-canvas/60 px-3 py-4" aria-label="Üzenetek" aria-live="polite">
                {messages.length === 0 && (
                  <p className="m-auto max-w-[16rem] text-center text-sm text-muted">Még nincs üzenet. Írj rá {activeMember.displayName} névre!</p>
                )}
                {messages.map((message) => {
                  const mine = message.senderId === user.uid;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <article className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md border border-line bg-surface text-ink'}`}>
                        <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                        <time className={`mt-1 block text-right text-[10px] ${mine ? 'text-white/75' : 'text-muted'}`} dateTime={toDate(message.createdAt)?.toISOString()}>
                          {formatDateTime(message.createdAt)}
                        </time>
                      </article>
                    </div>
                  );
                })}
                <div ref={endOfMessages} />
              </div>
              <form className="flex shrink-0 items-end gap-2 border-t border-line bg-surface p-3" onSubmit={handleSend}>
                <label className="sr-only" htmlFor="admin-chat-message">Üzenet</label>
                <textarea
                  id="admin-chat-message"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm focus:border-brand"
                  rows={1}
                  maxLength={2000}
                  placeholder="Írj üzenetet…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form.requestSubmit();
                    }
                  }}
                />
                <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50" aria-label="Üzenet küldése" disabled={sending || !draft.trim()}>
                  <Icon name="send" size={19} />
                </button>
              </form>
              <p className="sr-only" aria-live="polite">{sending ? 'Üzenet küldése folyamatban' : ''}</p>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-line px-3 py-3">
                <label className="sr-only" htmlFor="admin-chat-search">Szerkesztőségi tag keresése</label>
                <input id="admin-chat-search" className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm" placeholder="Tag keresése…" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {loadingMembers && <p className="px-3 py-4 text-sm text-muted" role="status">Tagok betöltése…</p>}
                {!loadingMembers && contacts.length === 0 && <p className="px-3 py-4 text-sm text-muted">Nincs megjeleníthető szerkesztőségi tag.</p>}
                {contacts.map((member) => {
                  const chat = chats.find((item) => item.id === directChatId(user.uid, member.uid));
                  const unread = chat?.unreadFor?.includes(user.uid);
                  return (
                    <button key={member.uid} type="button" className="flex min-h-[4.5rem] w-full items-center gap-3 rounded-xl px-2.5 text-left hover:bg-canvas focus-visible:bg-canvas" onClick={() => showChat(member.uid)}>
                      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark">
                        {initials(member.displayName)}
                        {unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-brand" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${unread ? 'font-bold' : 'font-semibold'}`}>{member.displayName}</span>
                          {chat && <time className="shrink-0 text-[10px] text-muted">{formatDateTime(chat.lastMessageAt)}</time>}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">{chat?.lastMessage || roleName[member.role]}</span>
                      </span>
                      {unread && <span className="sr-only">Olvasatlan üzenet</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {!open && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-[70] grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-pop transition-transform hover:scale-105 hover:bg-brand-dark focus-visible:outline-offset-4"
          aria-label={unreadCount ? `Chat megnyitása, ${unreadCount} olvasatlan beszélgetés` : 'Chat megnyitása'}
          onClick={() => { setOpen(true); setPosition((current) => current || initialPosition()); }}
        >
          <Icon name="chat" size={23} />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-surface bg-danger px-1 text-xs font-bold text-white" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          <span className="sr-only" aria-live="polite">{unreadCount ? `${unreadCount} olvasatlan beszélgetés` : ''}</span>
        </button>
      )}
    </>
  );
}

// Firestore implementation of the repository API (see data/repository.js and devRepository.js for the full contract).
// Collections: schools, users, content, editorialNotes, topics, suggestions, settings, pollVotes.
// NOTE: not exercised against a live Firebase project yet. The business rules (assertAllowed, validation) run here too,
// but the authoritative enforcement is firestore.rules / storage.rules.
import {
  addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { getFirebase, getStorageInstance } from '../firebase/client.js';
import { assertAllowed, canEditContent } from '../config/transitions.js';
import { deriveTitle, emptyContentData, validatePublication } from '../config/content.js';
import { toDate } from '../lib/date.js';

const withId = (snap) => ({ id: snap.id, ...snap.data() });
const ms = (v, f) => toDate(v?.[f])?.getTime() || 0;
const byUpdatedDesc = (a, b) => ms(b, 'updatedAt') - ms(a, 'updatedAt');
const byCreatedDesc = (a, b) => ms(b, 'createdAt') - ms(a, 'createdAt');
const col = async (name) => { const { db } = await getFirebase(); return { db, c: collection(db, name) }; };
const ref = async (name, id) => { const { db } = await getFirebase(); return { db, r: doc(db, name, id) }; };

export const firestoreRepository = {
  mode: 'firebase',

  async getSchool(schoolId) { const { r } = await ref('schools', schoolId); const s = await getDoc(r); return s.exists() ? withId(s) : null; },
  async listMembers({ schoolId }) { const { c } = await col('users'); return (await getDocs(query(c, where('schoolId', '==', schoolId)))).docs.map((d) => ({ uid: d.id, ...d.data() })); },

  // ---- content ----
  // Query constraints match the security rules (otherwise Firestore rejects the whole query).
  async listContent({ schoolId, role, uid }) {
    const { c } = await col('content');
    const cs = [where('schoolId', '==', schoolId)];
    if (role === 'author') cs.push(where('authorId', '==', uid));
    return (await getDocs(query(c, ...cs))).docs.map(withId).sort(byUpdatedDesc);
  },
  async reassignDraft(id, memberUid, { user }) {
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('Piszkozatot csak szerkesztő vagy tanár ruházhat át.');
    const { db } = await getFirebase();
    const contentRef = doc(db, 'content', id);
    const memberRef = doc(db, 'users', memberUid);
    await runTransaction(db, async (tx) => {
      const [contentSnap, memberSnap] = await Promise.all([tx.get(contentRef), tx.get(memberRef)]);
      if (!contentSnap.exists() || contentSnap.data().schoolId !== user.schoolId || contentSnap.data().status !== 'draft') {
        throw new Error('Csak piszkozatot lehet átruházni.');
      }
      if (!memberSnap.exists() || memberSnap.data().schoolId !== user.schoolId || !['editor', 'author'].includes(memberSnap.data().role)) {
        throw new Error('Tanárnak nem lehet piszkozatot kijelölni.');
      }
      const content = contentSnap.data();
      const topicRef = content.topicId ? doc(db, 'topics', content.topicId) : null;
      const topicSnap = topicRef ? await tx.get(topicRef) : null;
      tx.update(contentRef, {
        authorId: memberUid,
        authorName: memberSnap.data().displayName,
        updatedAt: serverTimestamp(),
      });
      if (topicSnap?.exists() && topicSnap.data().contentId === id && topicSnap.data().status === 'claimed') {
        tx.update(topicRef, { claimedBy: memberUid, claimedByName: memberSnap.data().displayName });
      }
    });
    return withId(await getDoc(contentRef));
  },
  async listPublishedPolls({ schoolId }) {
    const { c } = await col('content');
    return (await getDocs(query(c, where('schoolId', '==', schoolId), where('status', '==', 'published')))).docs.map(withId).filter((item) => item.format === 'poll').sort(byCreatedDesc);
  },
  async listPublishedContent({ schoolId }) {
    const { c } = await col('content');
    return (await getDocs(query(c, where('schoolId', '==', schoolId), where('status', '==', 'published')))).docs
      .map(withId)
      .filter((item) => item.cardData)
      .sort((a, b) => ms(b, 'publishedAt') - ms(a, 'publishedAt'));
  },
  async getPublishedContent(id) {
    const { r } = await ref('content', id);
    const snapshot = await getDoc(r);
    if (!snapshot.exists()) return null;
    const content = withId(snapshot);
    return content.status === 'published' ? content : null;
  },
  async getContent(id) { const { r } = await ref('content', id); const s = await getDoc(r); return s.exists() ? withId(s) : null; },
  async saveContent(input, { user }) {
    const { db, c } = await col('content');
    const title = deriveTitle(input.format, input.title, input.contentData);
    if (input.id) {
      const r = doc(db, 'content', input.id);
      const cur = await getDoc(r);
      if (!cur.exists() || !canEditContent(user, { id: cur.id, ...cur.data() })) throw new Error('Ezt a tartalmat most nem szerkesztheted.');
      const patch = { title, category: input.category, contentData: input.contentData, updatedAt: serverTimestamp() };
      if (input.cardData) patch.cardData = input.cardData;
      if (input.topicId) patch.topicId = input.topicId;
      await updateDoc(r, patch);
      return withId(await getDoc(r));
    }
    const data = {
      schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, title, format: input.format, category: input.category,
      status: 'draft', contentData: input.contentData, cardData: null, topicId: input.topicId || null,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(), submittedAt: null, publishedAt: null,
    };
    const created = await addDoc(c, data);
    if (input.topicId) await updateDoc(doc(db, 'topics', input.topicId), { contentId: created.id });
    return withId(await getDoc(created));
  },
  async saveCard(id, cardData, { user }) {
    const { r } = await ref('content', id);
    const cur = await getDoc(r);
    if (!cur.exists() || !canEditContent(user, { id, ...cur.data() })) throw new Error('A kártyát most nem szerkesztheted.');
    await updateDoc(r, { cardData, updatedAt: serverTimestamp() });
    return withId(await getDoc(r));
  },
  async submitContent(id, { user }) {
    const { r } = await ref('content', id);
    const cur = await getDoc(r);
    const c = cur.exists() ? { id, ...cur.data() } : null;
    if (!c || !canEditContent(user, c)) throw new Error('Ezt a tartalmat most nem lehet beküldeni.');
    const settings = await this.getSettings(user.schoolId);
    if (!validatePublication(c, settings.limits).ok) throw new Error('A tartalom vagy a kártya hiányos, ezért nem küldhető be.');
    await updateDoc(r, { status: 'submitted', submittedAt: serverTimestamp(), updatedAt: serverTimestamp(), feedback: null });
    return withId(await getDoc(r));
  },
  async publishContent(id, { user }) {
    const { db } = await getFirebase();
    const r = doc(db, 'content', id);
    const cur = await getDoc(r);
    const c = cur.exists() ? { id, ...cur.data() } : null;
    if (user.role !== 'teacher' || !c || !canEditContent(user, c)) throw new Error('Közvetlenül csak a saját tartalmadat publikálhatod tanári jogosultsággal.');
    const settings = await this.getSettings(user.schoolId);
    if (!validatePublication(c, settings.limits).ok) throw new Error('A tartalom vagy a kártya hiányos, ezért nem publikálható.');
    const batch = writeBatch(db);
    batch.update(r, { status: 'published', submittedAt: serverTimestamp(), publishedAt: serverTimestamp(), updatedAt: serverTimestamp(), feedback: null });
    if (c.topicId) batch.update(doc(db, 'topics', c.topicId), { status: 'done' });
    await batch.commit();
    return withId(await getDoc(r));
  },
  // Status change + optional note + topic side effects in one atomic batch.
  async transition(id, actionId, { user, note }) {
    const { db } = await getFirebase();
    const r = doc(db, 'content', id);
    const cur = await getDoc(r);
    if (!cur.exists()) throw new Error('A tartalom nem található.');
    const c = { id, ...cur.data() };
    const a = assertAllowed(user, c, actionId);
    const text = (note || '').trim();
    if (a.note === 'required' && !text) throw new Error('Ehhez a művelethez meg kell adni egy megjegyzést.');
    const batch = writeBatch(db);
    const patch = { status: a.to, updatedAt: serverTimestamp() };
    if (a.to === 'published') { patch.publishedAt = serverTimestamp(); patch.feedback = null; }
    if (a.id === 'restore_to_draft') Object.assign(patch, { feedback: null, publishedAt: null, submittedAt: null });
    if (a.feedback) patch.feedback = text;
    batch.update(r, patch);
    if (text) batch.set(doc(collection(db, 'editorialNotes')), { contentId: id, schoolId: c.schoolId, authorId: user.uid, authorName: user.displayName, type: a.feedback ? 'feedback' : 'internal', text, createdAt: serverTimestamp() });
    if (c.topicId) {
      const tr = doc(db, 'topics', c.topicId);
      if (a.to === 'published') batch.update(tr, { status: 'done' });
      if (a.to === 'withdrawn') batch.update(tr, { status: 'open', claimedBy: null, claimedByName: null, contentId: null });
    }
    await batch.commit();
    return withId(await getDoc(r));
  },
  async getPollState(contentId, poll) {
    const { auth, db } = await getFirebase();
    await auth.authStateReady();
    const votes = await getDocs(query(collection(db, 'pollVotes'), where('pollId', '==', contentId)));
    const counts = (poll.options || []).map((option) => votes.docs.filter((vote) => vote.data().option === option).length);
    const voterId = auth.currentUser?.uid;
    const myVote = voterId ? votes.docs.find((vote) => vote.id === `${contentId}_${voterId}`) : null;
    return { counts, votedOptionIndex: myVote ? (poll.options || []).indexOf(myVote.data().option) : null };
  },
  async votePoll(contentId, optionIndex) {
    const { auth, db } = await getFirebase();
    await auth.authStateReady();
    let voter = auth.currentUser;
    if (!voter) {
      const { signInAnonymously } = await import('firebase/auth');
      voter = (await signInAnonymously(auth)).user;
    }
    const contentRef = doc(db, 'content', contentId);
    const contentSnap = await getDoc(contentRef);
    const content = contentSnap.exists() ? withId(contentSnap) : null;
    if (!content || content.status !== 'published' || content.format !== 'poll') throw new Error('Ez a szavazás nem érhető el.');
    const poll = content.contentData || {};
    if (!poll.endsAt || toDate(poll.endsAt)?.getTime() <= Date.now()) throw new Error('A szavazás lezárult.');
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= (poll.options || []).length) throw new Error('Érvénytelen válaszlehetőség.');
    await setDoc(doc(db, 'pollVotes', `${contentId}_${voter.uid}`), { pollId: contentId, option: poll.options[optionIndex], createdAt: serverTimestamp() });
    return this.getPollState(contentId, poll);
  },

  // ---- notes ----
  async listNotes(contentId, { role }) {
    const { c } = await col('editorialNotes');
    const cs = [where('contentId', '==', contentId)];
    if (role === 'author') cs.push(where('type', '==', 'feedback'));
    return (await getDocs(query(c, ...cs))).docs.map(withId).sort((a, b) => ms(a, 'createdAt') - ms(b, 'createdAt'));
  },
  async addNote(contentId, text, { user }) {
    const { c } = await col('editorialNotes');
    const d = await addDoc(c, { contentId, schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, type: 'internal', text: text.trim(), createdAt: serverTimestamp() });
    return withId(await getDoc(d));
  },

  // ---- topic ideas ----
  async listTopics({ schoolId }) {
    const { c } = await col('topics');
    return (await getDocs(query(c, where('schoolId', '==', schoolId), where('status', 'in', ['open', 'claimed'])))).docs.map(withId).sort(byCreatedDesc);
  },
  async createTopic({ title, note, category }, { user }) {
    if (!['teacher', 'editor', 'author'].includes(user.role)) throw new Error('Témát csak szerkesztőségi tag javasolhat.');
    const { c } = await col('topics');
    const d = await addDoc(c, { schoolId: user.schoolId, title: title.trim(), note: (note || '').trim(), category: category || '', status: 'open', createdBy: user.uid, createdByName: user.displayName, createdAt: serverTimestamp(), claimedBy: null, claimedByName: null, contentId: null });
    return withId(await getDoc(d));
  },
  async assignTopic(id, memberUid, { user }) {
    if (!['editor', 'teacher'].includes(user.role)) throw new Error('Témát csak szerkesztő vagy tanár jelölhet ki.');
    const { db } = await getFirebase();
    const topicRef = doc(db, 'topics', id);
    const memberRef = doc(db, 'users', memberUid);
    const contentRef = doc(collection(db, 'content'));
    await runTransaction(db, async (tx) => {
      const [topicSnap, memberSnap] = await Promise.all([tx.get(topicRef), tx.get(memberRef)]);
      if (!topicSnap.exists() || topicSnap.data().schoolId !== user.schoolId || topicSnap.data().status !== 'open') {
        throw new Error('Csak szabad témát lehet kijelölni.');
      }
      if (!memberSnap.exists() || memberSnap.data().schoolId !== user.schoolId || !['editor', 'author'].includes(memberSnap.data().role)) {
        throw new Error('Tanárnak nem lehet témát kijelölni.');
      }
      const topic = topicSnap.data();
      const member = memberSnap.data();
      tx.set(contentRef, {
        schoolId: user.schoolId, authorId: memberUid, authorName: member.displayName, title: topic.title,
        format: 'short_article', category: topic.category || '', status: 'draft',
        contentData: emptyContentData('short_article'), cardData: null, topicId: id,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(), submittedAt: null, publishedAt: null,
      });
      tx.update(topicRef, {
        status: 'claimed', claimedBy: memberUid, claimedByName: member.displayName,
        claimedAt: serverTimestamp(), contentId: contentRef.id,
      });
    });
    return withId(await getDoc(contentRef));
  },
  // A transaction makes sure two editors cannot claim the same topic at the same time.
  async claimTopic(id, { user }) {
    const { db } = await getFirebase();
    const r = doc(db, 'topics', id);
    await runTransaction(db, async (tx) => {
      const s = await tx.get(r);
      if (!s.exists() || s.data().status === 'done') throw new Error('Ez a téma már nem elérhető.');
      const t = s.data();
      if (t.status === 'claimed' && t.claimedBy !== user.uid) throw new Error(`Ezt a témát ${t.claimedByName} már lefoglalta.`);
      tx.update(r, { status: 'claimed', claimedBy: user.uid, claimedByName: user.displayName, claimedAt: serverTimestamp() });
    });
    return withId(await getDoc(r));
  },
  async releaseTopic(id) { const { r } = await ref('topics', id); await updateDoc(r, { status: 'open', claimedBy: null, claimedByName: null, contentId: null }); return withId(await getDoc(r)); },
  async discardTopic(id) { const { r } = await ref('topics', id); await deleteDoc(r); },
  async countOpenTopics({ schoolId }) { const { c } = await col('topics'); return (await getCountFromServer(query(c, where('schoolId', '==', schoolId), where('status', '==', 'open')))).data().count; },

  // ---- student suggestions ----
  async listSuggestions({ schoolId }) {
    const { c } = await col('suggestions');
    return (await getDocs(query(c, where('schoolId', '==', schoolId)))).docs.map(withId).sort(byCreatedDesc);
  },
  async createSuggestion({ category, title, text }, { user }) {
    const { c } = await col('suggestions');
    const d = await addDoc(c, { schoolId: user.schoolId, authorId: user.uid, authorName: user.displayName, category, title: title.trim(), text: (text || '').trim(), status: 'new', note: '', createdAt: serverTimestamp() });
    return withId(await getDoc(d));
  },
  async updateSuggestion(id, patch, { user }) {
    const { r } = await ref('suggestions', id);
    await updateDoc(r, { ...(patch.status ? { status: patch.status } : {}), ...(patch.note !== undefined ? { note: patch.note } : {}), reviewedBy: user.displayName, updatedAt: serverTimestamp() });
    return withId(await getDoc(r));
  },
  async countNewSuggestions({ schoolId }) {
    const { c } = await col('suggestions');
    return (await getCountFromServer(query(c, where('schoolId', '==', schoolId), where('status', '==', 'new')))).data().count;
  },

  // ---- settings ----
  async getSettings(schoolId) { const { r } = await ref('settings', schoolId); const s = await getDoc(r); return s.exists() ? { schoolId, limits: {}, ...s.data() } : { schoolId, limits: {} }; },
  async saveSettings(settings, { user }) { const { r } = await ref('settings', user.schoolId); await setDoc(r, { ...settings, schoolId: user.schoolId, updatedAt: serverTimestamp() }); return this.getSettings(user.schoolId); },

  // ---- images (Firebase Storage) ----
  async uploadImage(file, { user }) {
    const storage = await getStorageInstance();
    const { ref: sref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const safe = (file.name || 'kep').replace(/[^a-zA-Z0-9._-]/g, '_');
    const r = sref(storage, `content-images/${user.schoolId}/${user.uid}/${Date.now()}-${safe}`);
    await uploadBytes(r, file.blob, { contentType: file.blob.type });
    return getDownloadURL(r);
  },
};

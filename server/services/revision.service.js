const Note = require("../models/note.model");
const NoteRevisionLog = require("../models/noteRevisionLog.model");

const revisionIntervals = [1, 3, 7, 14, 30];

// ─────────────────────────────────────────
// 1. Due notes (revision page ke liye)
// ─────────────────────────────────────────
const getDueRevisionNotes = async (userId) => {
  return await Note.find({
    createdBy: userId,
    revisionDueDate: { $lte: new Date() },
  }).sort({ revisionDueDate: "asc" });
};

// ─────────────────────────────────────────
// 2. Mark as revised (smart spaced repetition)
// ─────────────────────────────────────────
const markNoteAsRevised = async (
  noteId,
  userId,
  rating = "got_it",
  durationMinutes = 0
) => {
  const note = await Note.findOne({ _id: noteId, createdBy: userId });

  if (!note) {
    throw new Error("Note not found or unauthorized");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(note.revisionDueDate || today);
  dueDate.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLate = Math.max(0, Math.floor((today - dueDate) / msPerDay));

  const currentStage = note.revisionStage || 0;
  let nextStage;

  // Rating-based logic (drill se aayega)
  if (rating === "forgot") {
    // Bilkul bhool gaya → reset
    nextStage = 0;
    note.skippedCount = (note.skippedCount || 0) + 1;
  } else if (rating === "shaky") {
    // Yaad tha but confident nahi → same stage
    nextStage = currentStage;
    note.skippedCount = (note.skippedCount || 0) + 1;
  } else {
    // got_it → time pe tha ya thoda late
    if (daysLate === 0) {
      nextStage = currentStage + 1;         // on time → reward
    } else if (daysLate <= 2) {
      nextStage = currentStage;             // thoda late → same
      note.skippedCount = (note.skippedCount || 0) + 1;
    } else {
      nextStage = Math.max(0, currentStage - 1); // zyada late → penalize
      note.skippedCount = (note.skippedCount || 0) + 1;
    }
  }

  const daysToAdd =
    revisionIntervals[Math.min(nextStage, revisionIntervals.length - 1)];

  const baseDate = daysLate > 0 ? today : dueDate;
  const newDueDate = new Date(baseDate);
  newDueDate.setDate(newDueDate.getDate() + daysToAdd);

  note.revisionStage = nextStage;
  note.revisionDueDate = newDueDate;
  note.lastRevisedAt = new Date();
  note.revisionCount = (note.revisionCount || 0) + 1;
  note.totalRevisionMinutes = (note.totalRevisionMinutes || 0) + Math.max(0, Number(durationMinutes) || 0);

  await NoteRevisionLog.create({
    userId,
    noteId: note._id,
    rating,
    durationMinutes: Math.max(0, Number(durationMinutes) || 0),
    revisedAt: new Date(),
  });

  return await note.save();
};

// ─────────────────────────────────────────
// 3. Drill — random 10 due notes (interview practice)
// ─────────────────────────────────────────
const getDrillNotes = async (userId) => {
  const dueNotes = await Note.find({
    createdBy: userId,
    revisionDueDate: { $lte: new Date() },
  });

  // Agar due notes kam hain to weak notes bhi mix karo
  if (dueNotes.length < 5) {
    const weakNotes = await Note.find({
      createdBy: userId,
      skippedCount: { $gte: 1 },
      revisionDueDate: { $gt: new Date() }, // already due nahi hain
    }).limit(10 - dueNotes.length);

    const combined = [...dueNotes, ...weakNotes];
    return combined.sort(() => Math.random() - 0.5).slice(0, 10);
  }

  return dueNotes.sort(() => Math.random() - 0.5).slice(0, 10);
};

// ─────────────────────────────────────────
// 4. Weak notes — baar baar bhoolne wale
// ─────────────────────────────────────────
const getWeakNotes = async (userId) => {
  return await Note.find({
    createdBy: userId,
    skippedCount: { $gte: 2 },
  }).sort({ skippedCount: -1 }); // sabse weak pehle
};

module.exports = {
  getDueRevisionNotes,
  markNoteAsRevised,
  getDrillNotes,
  getWeakNotes,
};
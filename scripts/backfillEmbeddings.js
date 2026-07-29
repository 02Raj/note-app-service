require("dotenv").config();
const mongoose = require("mongoose");
const Note = require("../server/models/note.model");
const { generateEmbedding } = require("../server/utils/ai.util");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

const backfillEmbeddings = async () => {
    await connectDB();

    console.log("Fetching notes without embeddings...");
    // Find notes that either don't have the embedding field or the array is empty
    const notes = await Note.find({ 
        $or: [
            { embedding: { $exists: false } },
            { embedding: { $size: 0 } }
        ]
    });

    console.log(`Found ${notes.length} notes that need embeddings.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        try {
            const textToEmbed = `${note.title || ''} ${note.content || ''}`.trim();
            if (textToEmbed) {
                const embedding = await generateEmbedding(textToEmbed);
                note.embedding = embedding;
                await note.save();
                successCount++;
                console.log(`[${i+1}/${notes.length}] ✅ Successfully embedded note: "${note.title}"`);
            } else {
                console.log(`[${i+1}/${notes.length}] ⏭️ Skipped empty note: ${note._id}`);
            }
            
            // To respect free tier rate limits (15 requests per minute for Gemini 1.5 Flash),
            // wait for 4.5 seconds between each request. (60s / 15 req = 4s)
            await new Promise(resolve => setTimeout(resolve, 4500));
        } catch (error) {
            failCount++;
            console.error(`[${i+1}/${notes.length}] ❌ Failed to embed note: "${note.title}" - ${error.message}`);
        }
    }

    console.log(`\n--- Backfill Complete ---`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    process.exit(0);
};

backfillEmbeddings();

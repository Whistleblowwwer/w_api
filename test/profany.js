import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";
import fs from "fs/promises"; // Using fs.promises for async file operations

async function getAllProfanityWords() {
    const profanity = new ProfanityEngine({ language: "es" });

    try {
        const allWords = await profanity.all();

        // Write the result to a JSON file
        await fs.writeFile(
            "profanityWords.json",
            JSON.stringify(allWords, null, 2)
        );

        console.log("Profanity words written to profanityWords.json");
    } catch (error) {
        console.error("Error fetching profanity words:", error);
    }
}

// Call the function to get and write the list of profanity words to a file
getAllProfanityWords();

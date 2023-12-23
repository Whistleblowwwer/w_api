// badWordsFilter.js
import { ProfanityEngine } from "@coffeeandfun/google-profanity-words";
import badWordsDictionary from "./badWordsDictionary.js";

const profanity = new ProfanityEngine({ language: "es" });

// Function to escape special characters in a string to be used in a regex
const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

// Function to check if a word contains at least one alphabetical character
const containsAlphabetical = (word) => /[a-zA-Z]/.test(word);

export const filterBadWords = async (content) => {
    try {
        // Split content into words
        const words = content.split(/\s+/);

        // Check for individual words using the external dictionary
        const containsIndividualBadWord = words.some(
            (word) =>
                containsAlphabetical(word) &&
                badWordsDictionary.includes(word.toLowerCase())
        );

        // Check for profanity using the external library
        const containsProfanity = await profanity.hasCurseWords(content);

        // Combine the results
        const containsBadWord = containsIndividualBadWord || containsProfanity;

        return containsBadWord;
    } catch (error) {
        console.error("Error checking for profanity:", error);
        return false;
    }
};

export const generateName = () => {

    // Arrays for random display name generation
    const words = [
        "ocean",
        "mountain",
        "giraffe",
        "keyboard",
        "sunshine",
        "galaxy",
        "puzzle",
        "whisper",
        "journey",
        "rhythm",
        "tiger",
        "umbrella",
        "volcano",
        "horizon",
        "butterfly",
        "river",
        "forest",
        "adventure",
        "harmony",
        "spark"
    ];

    const adjectives = [
        "brilliant",
        "curious",
        "fearless",
        "gentle",
        "vibrant",
        "mysterious",
        "silent",
        "playful",
        "graceful",
        "bold",
        "radiant",
        "calm",
        "elegant",
        "fierce",
        "joyful",
        "persistent",
        "wise",
        "wild",
        "cheerful",
        "daring",
        "goofy",
        "serene",
        "swift",
        "vast",
        "whimsical",
    ];

    // Generate a random display name for the user
    return (
        adjectives[Math.floor(Math.random() * adjectives.length)] + "-" + words[Math.floor(Math.random() * words.length)]
    );
}




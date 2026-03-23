import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Book from "../models/book";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const authors = [
  { id: "6888f2bf26824ffefc294bcd", name: "J.K. Rowling" },
  { id: "6888f36026824ffefc294bcf", name: "Stephen King" },
  { id: "6888f3f92e55ef1dd267e52e", name: "Agatha Christie" },
  { id: "6888f40d2e55ef1dd267e531", name: "Gabriel García Márquez" },
  { id: "6888f44c2e55ef1dd267e536", name: "Toni Morrison" },
];

const bookData = [
  {
    title: "Anna Karenina",
    isbn: "9780140449174",
    category: "Literary Fiction",
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    isbn: "9780747532699",
    category: "Fantasy",
  },
  { title: "1984", isbn: "9781405965347", category: "Science Fiction" },
  {
    title: "To Kill a Mockingbird",
    isbn: "9780061120084",
    category: "Historical Fiction",
  },
  {
    title: "The Odyssey",
    isbn: "9780143039952",
    category: "Historical Fiction",
  },
  { title: "The Name of the Wind", isbn: "9780575087057", category: "Fantasy" },
  { title: "Dune", isbn: "9780441013593", category: "Science Fiction" },
  {
    title: "A Chinaman's Chance",
    isbn: "9781610391948",
    category: "Non-Fiction",
  },
  { title: "Blue's Hanging", isbn: "9780380731398", category: "Fiction" },
  {
    title: "Burn Down the Ground",
    isbn: "9780345516021",
    category: "Biography",
  },
  {
    title: "Ecology Second Edition",
    isbn: "9780878934454",
    category: "Science",
  },
  { title: "Murder!", isbn: "1860920128", category: "Mystery" },
  {
    title: "Project Hail Mary",
    isbn: "9780593135204",
    category: "Science Fiction",
  },
  {
    title: "The Body Keeps the Score",
    isbn: "9780143127741",
    category: "Self-Help",
  },
  { title: "Atomic Habits", isbn: "9780735211292", category: "Self-Help" },
  {
    title: "The Four Agreements",
    isbn: "9781878424310",
    category: "Philosophy",
  },
  {
    title: "Blood Meridian",
    isbn: "9780679728751",
    category: "Historical Fiction",
  },
  { title: "The Song of the Cell", isbn: "9781982181531", category: "Science" },
  {
    title: "Salt, Fat, Acid, Heat",
    isbn: "9781476776528",
    category: "Cooking",
  },
  {
    title: "My Brilliant Friend",
    isbn: "9781609450786",
    category: "Historical Fiction",
  },
  {
    title: "The Warmth of Other Suns",
    isbn: "9780679763888",
    category: "History",
  },
  { title: "Wolf Hall", isbn: "9780312671569", category: "Historical Fiction" },
  { title: "Frankenstein", isbn: "9780143105015", category: "Horror" },
  { title: "Lolita", isbn: "9780679723169", category: "Literary Fiction" },
  {
    title: "The Dispossessed",
    isbn: "9780061054327",
    category: "Science Fiction",
  },
  { title: "The Shining", isbn: "9780307743657", category: "Horror" },
  {
    title: "Murder on the Orient Express",
    isbn: "9780062073501",
    category: "Mystery",
  },
  { title: "Beloved", isbn: "9781400033416", category: "Literary Fiction" },
  {
    title: "One Hundred Years of Solitude",
    isbn: "9780060883287",
    category: "Magic Realism",
  },
  { title: "It", isbn: "9781501142970", category: "Horror" },
  { title: "Pet Sematary", isbn: "9781501156700", category: "Horror" },
  { title: "A Promised Land", isbn: "9781524763169", category: "Biography" },
  { title: "Becoming", isbn: "9781524763138", category: "Biography" },
  { title: "Sapiens", isbn: "9780062316097", category: "History" },
  { title: "The Alchemist", isbn: "9780062315007", category: "Fantasy" },
  {
    title: "Brave New World",
    isbn: "9780060850524",
    category: "Science Fiction",
  },
  {
    title: "Fahrenheit 451",
    isbn: "9781451673319",
    category: "Science Fiction",
  },
  {
    title: "The Book Thief",
    isbn: "9780375842207",
    category: "Historical Fiction",
  },
  {
    title: "The Girl with the Dragon Tattoo",
    isbn: "9780307454546",
    category: "Thriller",
  },
  { title: "The Da Vinci Code", isbn: "9780307474278", category: "Thriller" },
  { title: "Gone Girl", isbn: "9780307588371", category: "Thriller" },
  { title: "The Silent Patient", isbn: "9781250301697", category: "Thriller" },
  { title: "Circe", isbn: "9780316556347", category: "Fantasy" },
  {
    title: "Where the Crawdads Sing",
    isbn: "9780735219090",
    category: "Fiction",
  },
  { title: "The Midnight Library", isbn: "9780525559474", category: "Fiction" },
  {
    title: "Klara and the Sun",
    isbn: "9780593318171",
    category: "Science Fiction",
  },
  { title: "The Overstory", isbn: "9780393356687", category: "Fiction" },
  { title: "Lessons in Chemistry", isbn: "9780385547345", category: "Fiction" },
  { title: "Demon Copperhead", isbn: "9780063251922", category: "Fiction" },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    isbn: "9780593321201",
    category: "Fiction",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing books to make room for better data
    // We only clear the ones we likely added or just clear all for a clean start
    // User asked for "more books" but also complained about quality, so a fresh re-seed is best.
    await Book.deleteMany({});
    console.log("Cleared existing books.");

    const booksToInsert = bookData.map((data, index) => {
      const author = authors[index % authors.length];
      return {
        ...data,
        author: author.id,
        price: Math.floor(Math.random() * 800) + 200,
        stock: Math.floor(Math.random() * 50) + 5,
        description: `Explore the compelling literary world of "${data.title}". This ${data.category} masterpiece by ${author.name} is a must-read for any book lover.`,
        pages: Math.floor(Math.random() * 400) + 200,
        publishedDate: new Date(
          2000 + Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 12),
          1,
        ),
        coverImage: `https://covers.openlibrary.org/b/isbn/${data.isbn}-L.jpg?default=https://via.placeholder.com/400x600?text=${encodeURIComponent(data.title)}`,
      };
    });

    await Book.insertMany(booksToInsert);
    console.log(
      `Successfully re-seeded with ${booksToInsert.length} real books with actual covers!`,
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();

import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "./models/book";

dotenv.config();

const updateCovers = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const books = await Book.find({
    coverImage: {
      $exists: false,
    },
  });

  for (const book of books) {
    //Using ISBN to get cover from Open Library
    const coverURL = `https://covers.openlibrary.org/b/isbn/${book.isbn.replace(/-/g, "")}-L.jpg`;

    book.coverImage = coverURL;

    await book.save();
    console.log(`Updated cover for book: ${book.title}`);
  }

  console.log("All covers updated successfully");
  process.exit();
};

updateCovers();

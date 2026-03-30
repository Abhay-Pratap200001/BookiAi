"use server";

import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

// export const getAll

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();
    const slug = generateSlug(title);
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }
    return {
      exists: false,
    };
  } catch (error) {
    console.log("Error checking book exusts", error);
    return {
      exists: false,
      error: error,
    };
  }
};


export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();
    const slug = generateSlug(data.title);
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }

    //check subscription limit before create a book

    const book = await Book.create({ ...data, slug, totalSegment: 0 });
    return {
      success: true,
      data: serializeData(book),
    };
  } catch (error) {
    console.log("erro while creating the book", error);
    return {
      success: false,
      error: error,
    };
  }
};

export const saveBookSegement = async (
  bookId: string,
  clerkId: string,
  segment: TextSegment[],
) => {
  try {
    await connectToDatabase();
    console.log("Start saving book segments...");
    const segmentsToInsert = segment.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
        bookId,
        content: text,
        segment,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);
    await Book.findByIdAndUpdate(bookId, { totalSegments: segment.length });
    console.log("Book segment saved successfully");
    return{
      success: true,
      data:{
        segmentCreated: segment.length
      }
    }
  } catch (error) {
    console.log("Error while saving segement", error);
    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);
    console.log(
      "Delete book segments and book due to failure to save segments...");
    return{
      success: false,
      error: error
    }
  }
};

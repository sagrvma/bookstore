import { Link } from "react-router";
import { Book } from "../../api/admin";
import styles from "./BookCard.module.css";

type BookCardProps = {
  book: Book;
  currencyFormatter: Intl.NumberFormat;
  onAddtoCart(bookId: string): void;
};

const BookCard = ({ book, currencyFormatter, onAddtoCart }: BookCardProps) => {
  return (
    <div className={styles.card}>
      <Link to={`books/${book._id}`} className={styles.imageLink}>
        {/*Placeholder Cover*/}
        <div className={styles.placeholderCover}>
          <div className={styles.spine}></div>
          <span className={styles.emoji}>📖</span>
        </div>
      </Link>

      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.category}>{book.category}</span>
          <span className={styles.price}>
            {currencyFormatter.format(book.price)}
          </span>
        </div>
        <Link to={`/books/${book._id}`} className={styles.titleLink}>
          <h3>{book.title}</h3>
        </Link>

        <p className={styles.author}>
          {typeof book.author === "string"
            ? "Unknown Author"
            : book.author?.name}
        </p>
        <button
          className={styles.addToCartBtn}
          disabled={book.stock === 0}
          onClick={() => {
            onAddtoCart(book._id);
          }}
        >
          {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default BookCard;

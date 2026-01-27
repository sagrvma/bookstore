import { ChangeEvent } from "react";
import styles from "./BooksHero.module.css";

interface BooksHeroProps {
  searchTerm: string;
  onSearchChange(value: string): void;
}

const BooksHero = ({ searchTerm, onSearchChange }: BooksHeroProps) => {
  return (
    <div className={styles.heroWrapper}>
      <div className={styles.content}>
        <h1>Browse Collection</h1>
        <p>Find your next great idea from our curated collection.</p>
      </div>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by title, author or ISBN..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
        />
      </div>
    </div>
  );
};

export default BooksHero;

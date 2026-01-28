import { ChangeEvent, MouseEvent, MouseEventHandler } from "react";
import styles from "./BooksFilter.module.css";

export type BooksFiltersState = {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: "title" | "price" | "createdAt";
  sortOrder: "asc" | "desc";
};

interface BooksFiltersProps {
  filters: BooksFiltersState;
  categories: string[];
  onFilterChange(key: keyof BooksFiltersState, value: any): void;
  onClear(): void;
  currencyFormatter: Intl.NumberFormat;
}

const BooksFilter = ({
  filters,
  categories,
  onFilterChange,
  onClear,
  currencyFormatter,
}: BooksFiltersProps) => {
  return (
    <aside className={styles.sidebar}>
      {/*Category Filter*/}
      <div className={styles.filterGroup}>
        <h3>Categories</h3>
        <select
          className={styles.customSelect}
          value={filters.category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            onFilterChange("category", e.target.value);
          }}
        >
          <option value={""}>All Genres</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/*Price Range*/}
      <div className={styles.filterGroup}>
        <h3>Price Range</h3>
        <div className={styles.priceLabels}>
          <span> {currencyFormatter.format(filters.minPrice)}</span>
          <span> {currencyFormatter.format(filters.maxPrice)}</span>
        </div>
        <input
          className={styles.rangeSlider}
          type="range"
          min={0}
          max={5000}
          step={100}
          value={filters.minPrice}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            onFilterChange("minPrice", Number(e.target.value));
          }}
        />
        <input
          className={styles.rangeSlider}
          type="range"
          min={100}
          max={10000}
          step={100}
          value={filters.maxPrice}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onFilterChange("maxPrice", Number(e.target.value))
          }
        />
      </div>

      {/*Sorting*/}
      <div className={styles.filterGroup}>
        <h3>Sort By</h3>
        <select
          className={styles.customSelect}
          value={filters.sortBy}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onFilterChange("sortBy", e.target.value)
          }
        >
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="createdAt">Newest</option>
        </select>

        <div className={styles.sortToggle}>
          <button
            className={`${styles.sortBtn} ${filters.sortOrder === "asc" ? styles.active : ""}`}
            onClick={(e: MouseEvent<HTMLButtonElement>) =>
              onFilterChange("sortOrder", "asc")
            }
          >
            Asc
          </button>
          <button
            className={`${styles.sortBtn} ${filters.sortOrder === "desc" ? styles.active : ""}`}
            onClick={(e: MouseEvent<HTMLButtonElement>) =>
              onFilterChange("sortOrder", "desc")
            }
          >
            Desc
          </button>
        </div>
      </div>
      <button className={styles.resetBtn} onClick={onClear}>
        Reset Filters
      </button>
    </aside>
  );
};

export default BooksFilter;

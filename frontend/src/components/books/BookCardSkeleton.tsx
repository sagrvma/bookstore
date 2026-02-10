import styles from "./BookCardSkeleton.module.css";

const BookCardSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonAuthor}></div>
        <div className={styles.skeletonPrice}></div>
      </div>
    </div>
  );
};

export default BookCardSkeleton;

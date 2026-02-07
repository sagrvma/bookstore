import { useEffect, useState } from "react";
import {
  Cart,
  clearCart,
  getCart,
  removeCartItemById,
  updateCartItemById,
} from "../api/cart";
import { useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const data = await getCart();
      setCart(data);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setErr(error?.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onQuantityChange = async (id: string, newQuantity: number) => {
    try {
      await updateCartItemById(id, newQuantity);
      showToast("success", "Quantity updated!");
      await load();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to update quantity.";
      showToast("error", msg);
      setErr(msg);
    }
  };

  const onRemoveByItem = async (itemId: string) => {
    try {
      await removeCartItemById(itemId);
      showToast("success", "Item removed from cart.");
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to remove item.";
      showToast("error", msg);
      setErr(msg);
    }
  };

  const onClear = async () => {
    try {
      await clearCart();
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to remove item.";
      showToast("error", msg);
      setErr(msg);
    }
  };

  if (err) {
    return <p className={styles.error}>{err}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.cartWrapper}>
        <div className={styles.cartHeader}>
          <h2>Shopping Cart</h2>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <p>Your cart is empty.</p>
          <button
            className={styles.browseBtn}
            onClick={() => navigate("/books")}
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartWrapper}>
      <div className={styles.cartHeader}>
        <h2>Shopping Cart</h2>
        <span className={styles.itemCount}>
          {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className={styles.cartLayout}>
        <div className={styles.cartItemsSection}>
          <ul className={styles.cartList}>
            {cart.items.map((item) => {
              const book = item.book as any;
              const authorName =
                typeof book.author === "string"
                  ? book.author
                  : book.author?.name || "Unknown author";

              return (
                <li key={item._id} className={styles.cartItem}>
                  {/* Book cover placeholder */}
                  <div className={styles.bookCover}>
                    <span className={styles.bookIcon}>📚</span>
                  </div>

                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitle}>
                      {book?.title || item.title}
                    </div>
                    <div className={styles.itemMeta}>by {authorName}</div>
                    <div className={styles.itemPrice}>
                      {inr.format(item.price)}
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <label className={styles.qtyLabel}>
                      Qty
                      <input
                        className={styles.qtyInput}
                        type="number"
                        min={1}
                        max={10}
                        value={item.quantity}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v)) {
                            onQuantityChange(
                              item._id,
                              Math.max(1, Math.min(v, 10)),
                            );
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className={styles.itemTotal}>
                    {inr.format(item.subtotal ?? item.price * item.quantity)}
                  </div>

                  {/* Remove button repositioned */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemoveByItem(item._id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className={styles.cartSummary}>
          <h3>Order Summary</h3>

          <div className={styles.summaryRow}>
            <span>Total Quantity</span>
            <span>
              {cart.totalQuantity ??
                cart.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>
              {inr.format(
                cart.totalPrice ??
                  cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
              )}
            </span>
          </div>

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>
              {inr.format(
                cart.totalPrice ??
                  cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
              )}
            </span>
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={() => navigate("/checkout", { replace: false })}
          >
            Proceed to Checkout
          </button>

          <button className={styles.clearBtn} onClick={() => onClear()}>
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;

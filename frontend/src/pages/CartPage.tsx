import { useEffect, useState } from "react";
import {
  Cart,
  clearCart,
  getCart,
  removeCartItemByBookId,
  removeCartItemById,
  updateCartItemById,
} from "../api/cart";
import { useNavigate } from "react-router";

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async () => {
    setErr(""); //Reset Error
    setLoading(true);

    try {
      const data = await getCart();
      setCart(data);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        //Expired or missing token
        navigate("/login", { replace: true });
        return;
      }
      setErr("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //Initial one time fetch
    load();
  }, []);

  const onQuantityChange = async (id: string, newQuantity: number) => {
    try {
      await updateCartItemById(id, newQuantity); //Update
      await load(); //Reload after mutation
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to update quantity.");
    }
  };

  const onRemoveByItem = async (itemId: string) => {
    try {
      await removeCartItemById(itemId);
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to remove item.");
    }
  };

  const onRemoveByBook = async (bookId: string) => {
    try {
      await removeCartItemByBookId(bookId);
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to remove item.");
    }
  };
  const onClear = async () => {
    try {
      await clearCart();
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to clear cart.");
    }
  };

  if (loading) {
    return <p className="status">Loading Cart...</p>;
  }

  if (err) {
    return <p className="error">{err}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cartWrapper">
        <h2>Cart</h2>
        <p className="status">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cartWrapper">
      <h2>Cart</h2>
      <ul className="cartList">
        {cart.items.map((item) => {
          const book = item.book as any;
          const authorName =
            typeof book.author === "string"
              ? book.author
              : book.author?.name || "Unknown author";

          return (
            <li key={item._id} className="cartItem">
              <div className="itemInfo">
                <div className="itemTitle">{item.title}</div>
                <div className="itemMeta">
                  {book?.title ?? item.title} - {authorName}
                </div>
                <div className="itemPrice">{inr.format(item.price)}</div>
              </div>

              <div className="itemActions">
                <label>
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={item.quantity}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (Number.isFinite(v)) {
                        onQuantityChange(
                          item._id,
                          Math.max(1, Math.min(v, 10))
                        );
                      }
                    }}
                  />
                </label>
                <button onClick={() => onRemoveByItem(item._id)}>
                  Remove (by item)
                </button>
                {book?._id && (
                  <button onClick={() => onRemoveByBook(book._id)}>
                    Remove (by book)
                  </button>
                )}
              </div>
              <div className="itemTotal">
                Line Total :{" "}
                {inr.format(item.subtotal ?? item.price * item.quantity)}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="cartTotals">
        <div className="totalQuantity">
          Total Quantity :{" "}
          {cart.totalQuantity ?? cart.items.reduce((s, i) => s + i.quantity, 0)}
        </div>
        <div className="totalPrice">
          Total Price :{" "}
          {inr.format(
            cart.totalPrice ??
              cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
          )}
        </div>
      </div>

      <div className="cartActions">
        <button onClick={() => onClear()}>Clear Cart</button>
        <button onClick={() => navigate("/orders", { replace: false })}>
          Checkout
        </button>
      </div>
    </div>
  );
};

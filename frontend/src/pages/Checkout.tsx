import { useState } from "react";
import { Order, placeOrder, ShippingAddress } from "../api/order";
import { useNavigate } from "react-router";
import styles from "./Checkout.module.css";
import { useToast } from "../context/ToastContext";

const Checkout = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "card"
  >("cash_on_delivery");

  const [notes, setNotes] = useState("");

  const { showToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const order: Order = await placeOrder({
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes,
      });

      showToast("success", `Order ${order.orderNumber} placed successfully!`);
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
      }
      const msg = error?.response?.data?.message || "Failed to place order.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutWrapper}>
      <form className={styles.checkoutForm} onSubmit={onSubmit}>
        <fieldset>
          <legend>Shipping Address</legend>
          <label>
            Full Name
            <input
              required
              value={shippingAddress.fullName}
              type="text"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }));
              }}
            />
          </label>
          <label>
            Street
            <input
              required
              value={shippingAddress.street}
              type="text"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  street: e.target.value,
                }));
              }}
            />
          </label>

          <label>
            City
            <input
              required
              value={shippingAddress.city}
              type="text"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  city: e.target.value,
                }));
              }}
            />
          </label>

          <label>
            State
            <input
              required
              value={shippingAddress.state}
              type="text"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  state: e.target.value,
                }));
              }}
            />
          </label>
          <label>
            Pin Code
            <input
              required
              value={shippingAddress.pinCode}
              type="text"
              pattern="[1-9][0-9]{5}"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  pinCode: e.target.value,
                }));
              }}
            />
          </label>
          <label>
            Country
            <input
              required
              value={shippingAddress.country}
              type="text"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  country: e.target.value,
                }));
              }}
            />
          </label>
          <label>
            Phone
            <input
              required
              value={shippingAddress.phone}
              type="tel"
              pattern="(\+[1-9]\d{0,3})?[6-9]\d{9}"
              onChange={(e) => {
                setShippingAddress((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }));
              }}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Payment Method</legend>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cash_on_delivery"
              checked={paymentMethod === "cash_on_delivery"}
              onChange={(e) => {
                setPaymentMethod(e.target.value as "cash_on_delivery");
              }}
            />
            Cash on Delivery
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => {
                setPaymentMethod(e.target.value as "card");
              }}
            />
            Card
          </label>
        </fieldset>

        <label>
          Order Notes
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            placeholder="Any special instructions."
          />
        </label>

        <div className={styles.checkoutActions}>
          <button
            type="button"
            onClick={() => {
              navigate("/cart");
            }}
          >
            Back to Cart
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place order"}
          </button>
        </div>

        {err && <p className={styles.error}>{err}</p>}
      </form>
    </div>
  );
};

export default Checkout;

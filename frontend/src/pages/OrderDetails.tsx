import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { cancelOrder, getOrderById, Order } from "../api/order";
import styles from "./OrderDetails.module.css";
import { tokenStore } from "../lib/http";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "../routes/AdminRoute";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  let isAdmin = false;

  const token = tokenStore.get();

  if (token) {
    const payload = jwtDecode<JWTPayload>(token);
    isAdmin = payload.role === "admin";
  }

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async () => {
    if (!orderId) {
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const res = await getOrderById(orderId);
      setOrder(res);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      if (error?.response?.status === 404) {
        navigate("/orders", { replace: true });
        return;
      }

      setErr(error?.response?.data?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!order || cancelling) {
      return;
    }
    setCancelling(true);
    setErr("");
    try {
      await cancelOrder(order._id);
      await load();
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  if (loading) {
    return <p className={styles.status}>Loading...</p>;
  }
  if (err) {
    return <p className={styles.error}>{err}</p>;
  }

  if (!order) {
    return <p className={styles.error}>Order not found.</p>;
  }

  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <div className={styles.orderDetailsWrapper}>
      {/* Back Button */}
      <button
        className={styles.backToOrders}
        onClick={() => {
          if (isAdmin) {
            navigate("/admin/orders");
          } else {
            navigate("/orders");
          }
        }}
      >
        ← Back to Orders
      </button>

      {/* Header Section */}
      <div className={styles.orderHeader}>
        <div className={styles.orderTitleRow}>
          <h1>Order #{order.orderNumber}</h1>
          <div
            className={`${styles.orderStatusBadge} ${
              styles[`status-${order.status}`]
            }`}
          >
            {order.status}
          </div>
        </div>

        <div className={styles.orderInfoGrid}>
          <div className={styles.orderInfoItem}>
            <span className={styles.infoLabel}>Date Placed</span>
            <span className={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className={styles.orderInfoItem}>
            <span className={styles.infoLabel}>Payment Method</span>
            <span className={styles.infoValue}>
              {order.paymentMethod === "cash_on_delivery"
                ? "Cash on Delivery"
                : "Card"}
            </span>
          </div>
          <div className={styles.orderInfoItem}>
            <span className={styles.infoLabel}>Payment Status</span>
            <span className={styles.infoValue}>{order.paymentStatus}</span>
          </div>
          <div className={styles.orderInfoItem}>
            <span className={styles.infoLabel}>Total Amount</span>
            <span className={`${styles.infoValue} ${styles.total}`}>
              {inr.format(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.orderContentGrid}>
        {/* Left Column: Items */}
        <div className={styles.orderItemsCard}>
          <h2>Items in Order</h2>
          <div className={styles.itemsList}>
            {order.items.map((item) => (
              <div key={item._id} className={styles.orderItemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemTotal}>
                    {inr.format(item.lineTotal)}
                  </div>
                </div>
                <span className={styles.itemAuthor}>{item.author}</span>

                <div className={styles.itemPricing}>
                  <span className={styles.itemQty}>
                    {item.quantity} × {inr.format(item.price)}
                  </span>
                  <span className={styles.itemUnitPrice}>Unit Price</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary inside Items Card */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{inr.format(order.subtotal)}</span>
            </div>

            {(order.tax ?? 0) > 0 && (
              <div className={styles.totalRow}>
                <span>Tax</span>
                <span>{inr.format(order.tax!)}</span>
              </div>
            )}

            {(order.shippingCost ?? 0) > 0 && (
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>{inr.format(order.shippingCost!)}</span>
              </div>
            )}

            <div className={styles.grandTotalRow}>
              <span>Grand Total</span>
              <span>{inr.format(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className={styles.orderSidebar}>
          {/* Shipping Address Card */}
          <div className={styles.sidebarCard}>
            <h3>Shipping Address</h3>
            <div className={styles.addressText}>
              <strong>{order.shippingAddress.fullName}</strong>
              <br />
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.pinCode}
              <br />
              {order.shippingAddress.country}
              <br />
              <span className={styles.phone}>
                Phone: {order.shippingAddress.phone}
              </span>
            </div>
          </div>

          {/* Payment Info Card */}
          <div className={styles.sidebarCard}>
            <h3>Payment</h3>
            <div className={styles.paymentBadge}>
              {order.paymentMethod === "cash_on_delivery"
                ? "Cash on Delivery"
                : "Card"}
            </div>
          </div>

          {/* Notes Card */}
          {order.notes && (
            <div className={styles.sidebarCard}>
              <h3>Order Notes</h3>
              <p className={styles.notesText}>"{order.notes}"</p>
            </div>
          )}

          {/* Actions Card */}
          {canCancel && (
            <div className={styles.sidebarActions}>
              <button
                className={styles.cancelBtn}
                disabled={cancelling}
                onClick={onCancel}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

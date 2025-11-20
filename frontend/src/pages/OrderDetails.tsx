import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { cancelOrder, getOrderById, Order } from "../api/order";
import "./OrderDetails.css";
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
      await load(); //Reload after cancel
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
    return <p className="status">Loading...</p>;
  }
  if (err) {
    return <p className="error">{err}</p>;
  }

  if (!order) {
    return <p className="error">Order not found.</p>;
  }

  const canCancel = order.status === "pending" || order.status == "confirmed";

  return (
    <div className="orderDetailsWrapper">
      {/* Back Button */}
      <button
        className="backToOrders"
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
      <div className="orderHeader">
        <div className="orderTitleRow">
          <h1>Order #{order.orderNumber}</h1>
          <div className={`orderStatusBadge ${order.status}`}>
            {order.status}
          </div>
        </div>

        <div className="orderInfoGrid">
          <div className="orderInfoItem">
            <span className="infoLabel">Date Placed</span>
            <span className="infoValue">
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="orderInfoItem">
            <span className="infoLabel">Payment Method</span>
            <span className="infoValue">
              {order.paymentMethod.replace("_", " ")}
            </span>
          </div>
          <div className="orderInfoItem">
            <span className="infoLabel">Payment Status</span>
            <span className="infoValue" style={{ textTransform: "capitalize" }}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="orderInfoItem">
            <span className="infoLabel">Total Amount</span>
            <span className="infoValue total">
              {inr.format(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="orderContentGrid">
        {/* Left Column: Items */}
        <div className="orderItemsCard">
          <h2>Items in Order</h2>
          <div className="itemsList">
            {order.items.map((item) => (
              <div key={item._id} className="orderItemCard">
                <div className="itemHeader">
                  <div className="itemTitle">{item.title}</div>
                  <div className="itemTotal">{inr.format(item.lineTotal)}</div>
                </div>
                <span className="itemAuthor">{item.author}</span>

                <div className="itemPricing">
                  <span className="itemQty">
                    {item.quantity} x {inr.format(item.price)}
                  </span>
                  <span className="itemUnitPrice">Unit Price</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary inside Items Card */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "2px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "var(--text-light)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>
                {inr.format(order.subtotal)}
              </span>
            </div>
            {/* Tax Section */}
            {(order.tax ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "var(--text-light)" }}>Tax</span>
                <span style={{ fontWeight: 600 }}>
                  {inr.format(order.tax!)}
                </span>{" "}
                {/* or order.tax ?? 0 */}
              </div>
            )}
            {/* Shipping Section */}
            {(order.shippingCost ?? 0) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "var(--text-light)" }}>Shipping</span>
                <span style={{ fontWeight: 600 }}>
                  {inr.format(order.shippingCost!)}
                </span>{" "}
                {/* or order.shippingCost ?? 0 */}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              <span>Grand Total</span>
              <span>{inr.format(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="orderSidebar">
          {/* Shipping Address Card */}
          <div className="sidebarCard">
            <h3>Shipping Address</h3>
            <div className="addressText">
              <strong>{order.shippingAddress.fullName}</strong>
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.pinCode}
              <br />
              {order.shippingAddress.country}
              <br />
              Phone: {order.shippingAddress.phone}
            </div>
          </div>

          {/* Payment Info Card */}
          <div className="sidebarCard">
            <h3>Payment</h3>
            <div className="paymentBadge">
              {order.paymentMethod.replace("_", " ")}
            </div>
          </div>

          {/* Notes Card */}
          {order.notes && (
            <div className="sidebarCard">
              <h3>Order Notes</h3>
              <p className="notesText">"{order.notes}"</p>
            </div>
          )}

          {/* Actions Card */}
          {canCancel && (
            <div className="sidebarActions">
              <button
                className="cancelBtn"
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

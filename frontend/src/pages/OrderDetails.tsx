import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { cancelOrder, getOrderById, Order } from "../api/order";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

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
      <div className="orderDetailsHeader">
        <h2>Order #{order.orderNumber}</h2>
        <div className={`orderStatus status-${order.status}`}>
          {order.status}
        </div>
      </div>

      <div className="orderGrid">
        <section className="orderItems">
          <h3>Items</h3>
          <ul className="itemsList">
            {order.items.map((item) => (
              <li key={item._id} className="orderItem">
                <div className="itemInfo">
                  <div className="itemTitle">{item.title}</div>
                  <div className="itemMeta">{item.author}</div>
                </div>
                <div className="itemQty">x{item.quantity}</div>
                <div className="itemPrice">{inr.format(item.price)}</div>
                <div className="itemTotal">{inr.format(item.lineTotal)}</div>
              </li>
            ))}
          </ul>

          <div className="orderTotals">
            <div>Subtotal: {inr.format(order.subtotal)}</div>
            {order.tax && order.tax > 0 && (
              <div>Tax: {inr.format(order.tax)}</div>
            )}
            {order.shippingCost && order.shippingCost > 0 && (
              <div>Shipping Cost: {inr.format(order.shippingCost)}</div>
            )}
            <div className="totalAmount">{inr.format(order.totalAmount)}</div>
          </div>
        </section>

        <section className="orderInfo">
          <h3>Order Info</h3>
          <div className="infoGrid">
            <div>Status: {order.status}</div>
            <div>Payment: {order.paymentMethod.replace("_", " ")}</div>
            <div>Payment Status: {order.paymentStatus}</div>
            <div>
              Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </div>
          </div>
          <h4>Shipping Address</h4>
          <div className="address">
            <div>{order.shippingAddress.fullName}</div>
            <div>{order.shippingAddress.street}</div>
            <div>
              {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
              {order.shippingAddress.pinCode}
            </div>
            <div>{order.shippingAddress.country}</div>
            <div>{order.shippingAddress.phone}</div>
          </div>

          {order.notes && (
            <div>
              <h4>Notes</h4>
              <div className="orderNotes">{order.notes}</div>
            </div>
          )}
        </section>
      </div>

      <div className="orderActions">
        <button
          onClick={() => {
            navigate("/orders");
          }}
        >
          Back to Orders
        </button>
        {canCancel && (
          <button className="cancel" disabled={cancelling} onClick={onCancel}>
            {cancelling ? "Cancelling" : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;

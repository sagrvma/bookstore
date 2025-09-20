import { useEffect, useState } from "react";
import { cancelOrder, getOrdersByUser, OrdersPage } from "../api/order";
import { useNavigate } from "react-router";

const Orders = () => {
  const [data, setData] = useState<OrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async (pageNum: number) => {
    setLoading(true);
    setErr("");
    try {
      const res = await getOrdersByUser({ page: pageNum, limit: 10 });
      setData(res);
      setPage(pageNum);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setErr(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  if (loading && !data) {
    return <p className="status">Loading orders...</p>;
  }

  if (err) {
    return <p className="error">{err}</p>;
  }
  if (!data || data.orders.length === 0) {
    return (
      <div className="ordersWrapper">
        <h2>Your Orders</h2>
        <p className="status">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="ordersWrapper">
      <h2>Your orders</h2>
      <ul className="ordersList">
        {data.orders.map((order) => (
          <li key={order._id} className="orderItem">
            <div className="orderHeader">
              <div className="orderNumber">#{order.orderNumber}</div>
              <div className="orderStatus">Order Status : {order.status}</div>
            </div>
            <div className="orderMeta">
              <div>Items: {order.items.length}</div>
              <div>Total: {inr.format(order.totalAmount)}</div>
              <div>
                Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
            <div className="orderActions">
              <button
                onClick={() => {
                  navigate(`/orders/${order._id}`);
                }}
              >
                Order Details
              </button>
              {(order.status === "pending" || order.status === "confirmed") && (
                <button
                  onClick={async () => {
                    try {
                      await cancelOrder(order._id);
                      load(page); //Reload on cancelling.
                    } catch (error: any) {
                      setErr(
                        error?.response?.data?.message ||
                          "Failed to cancel order."
                      );
                    }
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button
          disabled={!data.pagination.hasPrev || loading}
          onClick={() => {
            load(page - 1);
          }}
        >
          Previous
        </button>

        <span>
          Page {data.pagination.currentPage} of {data.pagination.totalPages} (
          {data.pagination.totalOrders} total)
        </span>

        <button
          disabled={!data.pagination.hasNext || loading}
          onClick={() => {
            load(page + 1);
          }}
        >
          Next
        </button>

        {loading && <p className="status">Loading...</p>}
      </div>
    </div>
  );
};

export default Orders;

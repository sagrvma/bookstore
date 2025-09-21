import { useEffect, useState } from "react";
import { Order, OrdersPage } from "../../api/order";
import { getAllOrders, updateOrderStatus } from "../../api/admin";
import { useNavigate } from "react-router";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [data, setData] = useState<OrdersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const load = async (pageNum: number, status: string = statusFilter) => {
    setLoading(true);
    setErr("");
    try {
      const params: any = { page: pageNum, limit: 20 };
      if (status) {
        params.status = status;
      }
      const res = await getAllOrders(params);
      setData(res);
      setPage(pageNum);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (error?.response?.status === 403) {
        navigate("/", { replace: true });
        return;
      }
      setErr(error?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await load(page, statusFilter);
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    load(1, statusFilter);
  }, [statusFilter]);

  const statuses: Order["status"][] = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (loading && !data) {
    return <p className="status">Loading Orders...</p>;
  }

  return (
    <div className="adminOrdersWrapper">
      <div className="adminHeader">
        <h2>Manage Orders</h2>
        <div className="adminFilters">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && <p className="error">{err}</p>}

      {data && data.orders.length === 0 ? (
        <p className="status">No orders found.</p>
      ) : (
        <>
          <div className="ordersTable">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order.orderNumber}</td>
                    <td>{order.shippingAddress.fullName}</td>
                    <td>{order.items.length}</td>
                    <td>{inr.format(order.totalAmount)}</td>
                    <td>
                      <span className={`orderStatus status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div className="adminActions">
                        <select
                          value={order.status}
                          disabled={updating === order._id}
                          onChange={(e) => {
                            handleStatusUpdate(
                              order._id,
                              e.target.value as Order["status"]
                            );
                          }}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          className="viewBtn"
                          onClick={() => {
                            navigate(`/orders/${order._id}`);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="adminPagination">
            <button
              disabled={!data?.pagination.hasPrev || loading}
              onClick={() => {
                load(page - 1, statusFilter);
              }}
            >
              Prev
            </button>
            <span>
              Page {data?.pagination.currentPage} of{" "}
              {data?.pagination.totalPages} ({data?.pagination.totalOrders}{" "}
              total)
            </span>
            <button
              disabled={!data?.pagination.hasNext || loading}
              onClick={() => {
                load(page + 1, statusFilter);
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {loading && <p className="status">Loading...</p>}
    </div>
  );
};

export default AdminOrders;

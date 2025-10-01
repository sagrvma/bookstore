import { useEffect, useState } from "react";
import { getProfile, User } from "../api/user";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { showToast } = useToast();

  const navigate = useNavigate();

  const loadProfile = async () => {
    setErr("");
    setLoading(true);
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      const msg = error.response?.data?.message || "Failed to load profile.";
      showToast("error", msg);
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <p className="status">Loading profile...</p>;
  }

  if (err) {
    return <p className="error">{err}</p>;
  }

  if (!user) {
    return <p className="status">User not found.</p>;
  }

  const defaultAddress = user.addresses.find((addr) => addr.isDefault);

  return (
    <div className="profileWrapper">
      <div className="profileHeader">
        <h2>My Profile</h2>
        <div className="profileHeaderActions">
          <Link to="/profile/edit" className="editBtn">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="profileGrid">
        <section className="profileCard">
          <h3>Account Information</h3>
          <div className="profileInfo">
            <div className="infoItem">
              <span className="infoLabel">Name: </span>
              <span className="infoValue">{user.name}</span>
            </div>
            <div className="infoItem">
              <span className="infoLabel">Email: </span>
              <span className="infoValue">{user.email}</span>
            </div>
            <div className="infoItem">
              <span className="infoLabel">Role: </span>
              <span className={`roleTag role-${user.role}`}>{user.role}</span>
            </div>
            <div className="infoItem">
              <span className="infoLabel">Member since: </span>
              <span className="infoValue">
                {new Date(user.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>

          <div className="cardActions">
            <Link to="/profile/edit" className="actionBtn">
              Edit Info
            </Link>
            <Link to="/profile/password" className="actionBtn">
              Change Password
            </Link>
          </div>
        </section>

        <section className="profileCard">
          <h3>Default Address</h3>
          {defaultAddress ? (
            <div className="addressDisplay">
              <div className="addressName">{defaultAddress.fullName}</div>
              <div className="addressDetails">
                {defaultAddress.street}
                <br />
                {defaultAddress.city}, {defaultAddress.state}{" "}
                {defaultAddress.pinCode}
                <br />
                {defaultAddress.country}
                <br />
                Phone: {defaultAddress.phone}
              </div>
            </div>
          ) : (
            <div className="noAddress">
              <p>No default address set.</p>
            </div>
          )}
          <div className="cardActions">
            <Link to="/profile/addresses" className="actionBtn">
              Manage Addresses
            </Link>
          </div>
        </section>
        <section className="profileCard">
          <h3>Account Summary</h3>
          <div className="profileStats">
            <div className="statItem">
              <span className="statNumber">{user.addresses.length}</span>
              <span className="statLabel">Saved addresses</span>
            </div>
            <div className="statItem">
              <span className="statNumber">
                {user.role === "admin" ? "∞" : "?"}
              </span>
              <span className="statLabel">Orders</span>
            </div>
          </div>
          <div className="cardActions">
            <Link to="/orders" className="actionBtn">
              View Orders
            </Link>
          </div>
        </section>
      </div>

      <section className="quickActions">
        <h3>Quick Actions</h3>
        <div className="actionGrid">
          <Link to="/books" className="quickActionCard">
            <div className="actionIcon">📚</div>
            <div className="actionInfo">
              <div className="actionTitle">Browse Books</div>
              <div className="actionDesc">Discover new books to read</div>
            </div>
          </Link>
          <Link to="/cart" className="quickActionCard">
            <div className="actionIcon">🛒</div>
            <div className="actionInfo">
              <div className="actionTitle">My Cart</div>
              <div className="actionDesc">Review items in your cart</div>
            </div>
          </Link>
          <Link to="/orders" className="quickActionCard">
            <div className="actionIcon">📦</div>
            <div className="actionInfo">
              <div className="actionTitle">Order History</div>
              <div className="actionDesc">Track your past orders</div>
            </div>
          </Link>

          {user.role === "admin" && (
            <Link to="/admin/orders" className="quickActionCard adminAction">
              <div className="actionIcon">⚙️</div>
              <div className="actionInfo">
                <div className="actionTitle">Admin Panel</div>
                <div className="actionDesc">Manage orders and books</div>
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;

import { useEffect, useState } from "react";
import { getProfile, User } from "../api/user";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router";
import styles from "./Profile.module.css";
import LoadingSpinner from "../components/LoadingSpinner";

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
    return <LoadingSpinner />;
  }

  if (err) {
    return <p className={styles.error}>{err}</p>;
  }

  if (!user) {
    return <p className={styles.status}>User not found.</p>;
  }

  const defaultAddress = user.addresses.find((addr) => addr.isDefault);

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.profileHeader}>
        <h2>My Profile</h2>
        <div className={styles.profileHeaderActions}>
          <Link to="/profile/edit" className={styles.editBtn}>
            Edit Profile
          </Link>
        </div>
      </div>

      <div className={styles.profileGrid}>
        {/* Card 1: Account Information */}
        <section className={styles.profileCard}>
          <h3>Account Information</h3>
          <div className={styles.profileCardContent}>
            <div className={styles.profileInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name: </span>
                <span className={styles.infoValue}>{user.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email: </span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Role: </span>
                <span
                  className={`${styles.roleTag} ${
                    styles[
                      `role${
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      }`
                    ]
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member since: </span>
                <span className={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.cardActions}>
            <Link to="/profile/edit" className={styles.actionBtn}>
              Edit Info
            </Link>
            <Link to="/profile/password" className={styles.actionBtn}>
              Change Password
            </Link>
          </div>
        </section>

        {/* Card 2: Default Address */}
        <section className={styles.profileCard}>
          <h3>Default Address</h3>
          <div className={styles.profileCardContent}>
            {defaultAddress ? (
              <div className={styles.addressDisplay}>
                <div className={styles.addressName}>
                  {defaultAddress.fullName}
                </div>
                <div className={styles.addressDetails}>
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
              <div className={styles.noAddress}>
                <p>No default address set.</p>
              </div>
            )}
          </div>
          <div className={styles.cardActions}>
            <Link to="/profile/addresses" className={styles.actionBtn}>
              Manage Addresses
            </Link>
          </div>
        </section>

        {/* Card 3: Account Summary */}
        <section className={styles.profileCard}>
          <h3>Account Summary</h3>
          <div className={styles.profileCardContent}>
            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {user.addresses.length}
                </span>
                <span className={styles.statLabel}>Saved addresses</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {user.role === "admin" ? "∞" : "?"}
                </span>
                <span className={styles.statLabel}>Orders</span>
              </div>
            </div>
          </div>
          <div className={styles.cardActions}>
            <Link to="/orders" className={styles.actionBtn}>
              View Orders
            </Link>
          </div>
        </section>
      </div>

      <section className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link to="/books" className={styles.quickActionCard}>
            <div className={styles.actionIcon}>📚</div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTitle}>Browse Books</div>
              <div className={styles.actionDesc}>
                Discover new books to read
              </div>
            </div>
          </Link>

          <Link to="/cart" className={styles.quickActionCard}>
            <div className={styles.actionIcon}>🛒</div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTitle}>My Cart</div>
              <div className={styles.actionDesc}>Review items in your cart</div>
            </div>
          </Link>

          <Link to="/orders" className={styles.quickActionCard}>
            <div className={styles.actionIcon}>📦</div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTitle}>Order History</div>
              <div className={styles.actionDesc}>Track your past orders</div>
            </div>
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin/orders"
              className={`${styles.quickActionCard} ${styles.adminAction}`}
            >
              <div className={styles.actionIcon}>⚙️</div>
              <div className={styles.actionInfo}>
                <div className={styles.actionTitle}>Admin Panel</div>
                <div className={styles.actionDesc}>Manage orders and books</div>
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;

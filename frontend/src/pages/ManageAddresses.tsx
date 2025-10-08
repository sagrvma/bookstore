import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import {
  addAddress,
  Address,
  deleteAddress,
  getProfile,
  updateAddress,
  User,
} from "../api/user";
import { Link, useNavigate } from "react-router";

const ManageAddresses = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const { showToast } = useToast();

  //Form States
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const msg = error.response?.data?.message || "Failed to load profile.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      street: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const startEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let updatedUser = user;
      if (editingAddress) {
        updatedUser = await updateAddress(editingAddress._id!, formData);
        showToast("success", "Address updated successfully!");
      } else {
        updatedUser = await addAddress(formData);
        showToast("success", "Address added successfully!   ");
      }
      setUser(updatedUser);
      resetForm();
    } catch (error: any) {
      const msg = error.response?.data.message || "Failed to save address.";
      showToast("error", msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (addressId: string, isDefault: boolean) => {
    if (isDefault && user?.addresses.length === 1) {
      showToast(
        "warning",
        "Cannot delete the only address. Add another address first."
      );
    }

    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const updatedUser = await deleteAddress(addressId);
      setUser(updatedUser);
      showToast("success", "Address deleted successfully!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to delete address";
      showToast("error", msg);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updatedUser = await updateAddress(addressId, { isDefault: true });
      setUser(updatedUser);
      showToast("success", "Default address updated successfully!");
    } catch (error: any) {
      showToast("error", "Failed to update default address.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) return <p className="status">Loading addresses...</p>;
  if (err) return <p className="error">{err}</p>;
  if (!user) return <p className="error">User not found.</p>;

  return (
    <div className="manageAddressesWrapper">
      <div className="addressHeader">
        <h2>Manage Addresses</h2>
        <div className="headerActions">
          <button
            className="addBtn"
            onClick={() => {
              setShowForm(true);
            }}
          >
            Add New Address
          </button>
          <Link to="/profile" className="actionBtn">
            Back to Profile
          </Link>
        </div>
      </div>

      {/*Address Form*/}
      {showForm && (
        <div className="addressFormCard">
          <div className="addressFormHeader">
            <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
            <button onClick={resetForm} className="closeBtn">
              Reset
            </button>
          </div>
          <form className="addressForm" onSubmit={handleSubmit}>
            <div className="formGrid">
              <div className="formGroup">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }));
                  }}
                  placeholder="Enter Full Name"
                />
              </div>
              <div className="formGroup">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }));
                  }}
                  placeholder="Phone Number"
                />
              </div>
              <div className="formGroup fullWidth">
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  type="text"
                  required
                  maxLength={200}
                  value={formData.street}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }));
                  }}
                  placeholder="Enter Street Address"
                />
              </div>
              <div className="formGroup">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.city}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  placeholder="Enter City"
                />
              </div>
              <div className="formGroup">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  required
                  maxLength={50}
                  value={formData.state}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, state: e.target.value }));
                  }}
                  placeholder="Enter State"
                />
              </div>
              <div className="formGroup">
                <label htmlFor="pinCode">Pin Code</label>
                <input
                  id="pinCode"
                  type="text"
                  required
                  pattern="[1-9][0-9]{5}"
                  value={formData.pinCode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      pinCode: e.target.value,
                    }));
                  }}
                  placeholder="Pin Code"
                />
              </div>
              <div className="formGroup">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }));
                  }}
                  placeholder="Country"
                />
              </div>
              <div className="formGroup">
                <label className="checkboxLabel">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        isDefault: e.target.checked,
                      }));
                    }}
                  />
                  Set as default address
                </label>
              </div>
              <div className="formActions">
                <button className="cancelBtn" type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button
                  className="saveBtn"
                  type="submit"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Add Address"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/*Address List*/}
      <div className="addressesList">
        {user.addresses.length === 0 ? (
          <div className="noAddresses">
            <p className="status">No address found.</p>
            <button
              onClick={() => {
                setShowForm(true);
              }}
              className="addBtn"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="addressesGrid">
            {user.addresses.map((address) => (
              <div
                key={address._id}
                className={`addressCard ${
                  address.isDefault ? "defaultAddress" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="defaultBadge">Default</div>
                )}

                <div className="addressContent">
                  <div className="addressName">{address.fullName}</div>
                  <div className="addressDetails">
                    {address.street} <br />
                    {address.city}, {address.state} {address.pinCode} <br />
                    {address.country} <br />
                    Phone: {address.phone}
                  </div>
                </div>

                <div className="addressActions">
                  <button
                    onClick={() => startEdit(address)}
                    className="editBtn"
                  >
                    Edit
                  </button>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id!)}
                      className="defaultBtn"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleDelete(address._id!, address.isDefault || false)
                    }
                    className="deleteBtn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAddresses;

import { useEffect, useState } from "react";
import client from "../services/clientServices";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import { SuccessToast, ErrorToast } from "../components/ToastStyles";

const Sellers = () => {
  // Drawer State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Table Data
  const [sellers, setSellers] = useState<any[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState("5");
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer form
  const [sellerData, setSellerData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    isActive: "yes",
  });

  // Fetch Sellers
  const fetchSellers = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));

      if (searchName.trim()) params.set("search", searchName.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res = await client.get(`/sellers?${params.toString()}`);

      setSellers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.custom(() => <ErrorToast message="Failed to load sellers" />);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [currentPage, limit, searchName, statusFilter]);

  // Handle Add New
  const openCreateDrawer = () => {
    setEditMode(false);
    setEditId(null);
    setSellerData({
      name: "",
      email: "",
      contactNumber: "",
      isActive: "yes",
    });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (seller: any) => {
    setEditMode(true);
    setEditId(seller.id);

    setSellerData({
      name: seller.name,
      email: seller.email,
      contactNumber: seller.contactNumber,
      isActive: seller.isActive ? "yes" : "no",
    });

    setOpen(true);
  };

  // Delete Seller
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this seller?")) return;

    try {
      const res = await client.delete(`/sellers/${id}`);
      toast.custom(() => <SuccessToast message={res.data.message} />);
      fetchSellers();
    } catch (err: any) {
      toast.custom(() => (
        <ErrorToast
          message={err?.response?.data?.message || "Failed to delete"}
        />
      ));
    }
  };

  // Submit (Create / Update)
  const submitSeller = async (e: any) => {
    e.preventDefault();

    const payload = {
      name: sellerData.name,
      email: sellerData.email,
      contactNumber: sellerData.contactNumber,
      isActive: sellerData.isActive === "yes",
    };

    try {
      if (editMode && editId) {
        const res = await client.put(`/sellers/${editId}`, payload);
        toast.custom(() => <SuccessToast message={res.data.message} />);
      } else {
        const res = await client.post(`/sellers`, payload);
        toast.custom(() => <SuccessToast message={res.data.message} />);
      }

      setOpen(false);
      fetchSellers();
    } catch (err: any) {
      toast.custom(() => (
        <ErrorToast message={err?.response?.data?.message || "Action failed"} />
      ));
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={openCreateDrawer}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
        >
          + Add Seller
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl border overflow-hidden">
        <div className="max-h-[475px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white sticky top-0 z-10">
              <tr>
                {/* NAME WITH SEARCH */}
                <th className="p-3 text-left">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium">Name</span>
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={searchName}
                      onChange={(e) => {
                        setSearchName(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white border text-black rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </th>

                {/* ACTIVE FILTER */}
                <th className="p-3 text-left">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium">Active</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-white border text-black rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </th>

                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Contact</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sellers.length > 0 ? (
                sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">{seller.name}</td>

                    <td className="p-4 font-semibold">
                      {seller.isActive ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>

                    <td className="p-4">{seller.email}</td>

                    <td className="p-4">{seller.contactNumber}</td>

                    <td className="p-4 flex gap-4">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(seller)}
                      >
                        <FiEdit size={18} className="text-amber-400"/>
                      </button>

                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(seller.id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-500 font-medium"
                  >
                    No sellers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <select
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-md px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page: number) => setCurrentPage(page)}
        />
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-5 flex justify-between items-center bg-slate-900 text-white border-b">
          <h2 className="text-xl font-semibold">
            {editMode ? "Update Seller" : "Add Seller"}
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 text-2xl"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={submitSeller} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={sellerData.name}
              onChange={(e) =>
                setSellerData({ ...sellerData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2"
              value={sellerData.email}
              onChange={(e) =>
                setSellerData({ ...sellerData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Number</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={sellerData.contactNumber}
              onChange={(e) =>
                setSellerData({
                  ...sellerData,
                  contactNumber: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Active</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={sellerData.isActive}
              onChange={(e) =>
                setSellerData({ ...sellerData, isActive: e.target.value })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-700"
          >
            {editMode ? "Update Seller" : "Save Seller"}
          </button>
        </form>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default Sellers;

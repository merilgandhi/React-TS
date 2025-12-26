import { useEffect, useState } from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import client from "../../services/clientServices";
import toast from "react-hot-toast";
import { ErrorToast } from "../../components/ToastStyles";
import { useNavigate } from "react-router-dom";
import DeleteConfirmation from "../../components/DeleteConfirmation";
const OrdersList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; orderId: number | null; isDeleting: boolean }>({ open: false, orderId: null, isDeleting: false });
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await client.get("/orders");
      setOrders(res.data.data || []);
    } catch {
      toast.custom(() => <ErrorToast message="Failed to load orders" />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  const openDeleteModal = (orderId: number) => {
    setDeleteModal({ open: true, orderId, isDeleting: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, orderId: null, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.orderId == null) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await client.delete(`/orders/${deleteModal.orderId}`);
      toast.custom(() => <ErrorToast message="Order deleted" />);
      closeDeleteModal();
      fetchOrders();
    } catch {
      toast.custom(() => <ErrorToast message="Failed to delete order" />);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleView = (orderId: number) => {
    navigate(`/orders/view/${orderId}`);
  };

  const handleUpdate = (orderId: number) => {
    navigate(`/orders/edit/${orderId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Order List</h2>

      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-4 py-3 text-left border-r border-slate-700">
                Order ID
              </th>
              <th className="px-4 py-3 text-left border-r border-slate-700">
                Seller
              </th>
              <th className="px-4 py-3 text-right border-r border-slate-700">
                Subtotal
              </th>
              <th className="px-4 py-3 text-right border-r border-slate-700">
                GST
              </th>
              <th className="px-4 py-3 text-right border-r border-slate-700">
                Grand Total
              </th>
              <th className="px-4 py-3 text-left border-r border-slate-700">
                Status
              </th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 border-r font-medium text-slate-700">
                  {order.id}
                </td>

                <td className="px-4 py-3 border-r text-slate-700">
                  {order.seller?.name || "N/A"}
                </td>

                <td className="px-4 py-3 text-right border-r tabular-nums">
                  ₹{order.subtotal}
                </td>

                <td className="px-4 py-3 text-right border-r tabular-nums">
                  ₹{order.gstTotal}
                </td>

                <td className="px-4 py-3 text-right border-r tabular-nums font-semibold">
                  ₹{order.grandTotal}
                </td>

                <td className="px-4 py-3 border-r">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-4">
                    <FiEye
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={() => handleView(order.id)}
                    />
                    <FiEdit
                      className="cursor-pointer text-amber-600 hover:text-amber-800"
                      onClick={() => handleUpdate(order.id)}
                    />
                    <FiTrash2
                      className="cursor-pointer text-red-600 hover:text-red-800"
                      onClick={() => openDeleteModal(order.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteModal.isDeleting}
        itemName={
          orders.find((o) => o.id === deleteModal.orderId)?.id
            ? `Order #${orders.find((o) => o.id === deleteModal.orderId)?.id}`
            : undefined
        }
        title="Delete Order"
        message="Are you sure you want to delete"
      />
    </div>
  );
};

export default OrdersList;

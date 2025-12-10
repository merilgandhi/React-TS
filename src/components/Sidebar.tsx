import React, { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiShoppingBag,
  FiList,
  FiGitMerge,
  FiChevronDown,
  FiUserCheck,
} from "react-icons/fi";

const Sidebar: React.FC = () => {
  const [openProducts, setOpenProducts] = useState(false);

  return (
    <aside className="bg-slate-900 text-white w-64 h-screen p-5 space-y-6">

      <h2 className="text-xl font-bold mb-6">Inventory Panel</h2>

      <nav className="space-y-3">

        {/* PRODUCTS DROPDOWN */}
        <div>
          <button
            className="flex items-center justify-between w-full text-left hover:text-amber-300"
            onClick={() => setOpenProducts(!openProducts)}
          >
            <span className="flex items-center space-x-2">
              <FiShoppingBag size={18} />
              <span>Manage Product</span>
            </span>
            <FiChevronDown
              className={`${openProducts ? "rotate-180" : ""} transition`}
            />
          </button>

          {openProducts && (
            <div className="ml-6 mt-2 space-y-2">

              {/* PRODUCT LIST */}
              <Link
                to="/products/edit"
                className="flex items-center space-x-2 hover:text-amber-300"
              >
                <FiList size={16} />
                <span>Products List</span>
              </Link>

              {/* VARIATIONS */}
              <Link
                to="/products/variations"
                className="flex items-center space-x-2 hover:text-amber-300"
              >
                <FiGitMerge size={16} />
                <span>Variations</span>
              </Link>

            </div>
          )}
        </div>

        {/* SELLERS */}
        <Link
          to="/stock"
          className="flex items-center space-x-2 hover:text-amber-300"
        >
          <FiUserCheck size={18} />
          <span>Seller</span>
        </Link>

      </nav>
    </aside>
  );
};

export default Sidebar;

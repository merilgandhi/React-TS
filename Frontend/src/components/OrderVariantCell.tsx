import React from "react";
import { calcBoxes } from "../utils/orderCalculations";

type OrderVariantCellProps = {
  quantity: number;
  variation: {
    boxQuantity: number;
  };
  onChange: (value: number) => void;
  disabled?: boolean;
};

const OrderVariantCell: React.FC<OrderVariantCellProps> = ({
  quantity,
  variation,
  disabled = false,
  onChange,
}) => {
  const subCalculation = calcBoxes(quantity, variation.boxQuantity);

  return (
    <>
      {/* Quantity */}
      <td className="border-r px-2 py-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={quantity === 0 ? "" : quantity}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            value = value.replace(/^0+(?=\d)/, "");
            onChange(value === "" ? 0 : Number(value));
          }}
          className={`
            w-full rounded-md border px-2 py-1 text-right text-xs
            tabular-nums
            ${disabled
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"}
          `}
        />
      </td>

      {/* Boxes */}
      <td className="border-r px-2 py-2">
        <input
          type="text"
          disabled
          value={subCalculation.boxes}
          className="
            w-full rounded-md border px-2 py-1 text-right text-xs
            tabular-nums bg-slate-50 text-slate-600
          "
        />
      </td>

      {/* Remaining */}
      <td className="border-r px-2 py-2">
        <input
          type="text"
          disabled
          value={subCalculation.remaining}
          className="
            w-full rounded-md border px-2 py-1 text-right text-xs
            tabular-nums bg-slate-50 text-slate-600
          "
        />
      </td>
    </>
  );
};

export default OrderVariantCell;

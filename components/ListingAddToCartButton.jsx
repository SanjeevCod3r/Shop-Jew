"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  productRequiresSize,
  getProductSizeOptions,
} from "@/lib/product-sizes";

/**
 * Bag button on product cards: opens size picker when the piece requires a size, then calls onAdd(size).
 * @param {object} product
 * @param {(size: string | null) => void | Promise<void>} onAdd — size null when product does not require sizes
 * @param {boolean} [requireAuth] — if true and user is not authenticated, runs onUnauthenticated
 * @param {boolean} [authenticated] — pass !!token from parent when requireAuth is true
 * @param {boolean} [authHydrated] — auth store finished rehydrating (pass `hydrated` from useAuthStore) so we don’t redirect before token loads
 * @param {() => void} [onUnauthenticated]
 * @param {boolean} [disabled]
 * @param {string} [className] — button classes
 */
export default function ListingAddToCartButton({
  product,
  onAdd,
  requireAuth = false,
  authenticated = true,
  authHydrated = true,
  onUnauthenticated,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const needsSize = productRequiresSize(product);
  const sizeOptions = getProductSizeOptions(product);

  const runAdd = async (size) => {
    try {
      await onAdd(size);
    } catch (e) {
      console.error(e);
      toast.error("Could not add to cart");
    }
  };

  const handleBagClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || (requireAuth && !authHydrated)) return;
    if (requireAuth && authHydrated && !authenticated && onUnauthenticated) {
      onUnauthenticated();
      return;
    }
    if (!needsSize) {
      runAdd(null);
      return;
    }
    setSelectedSize(null);
    setOpen(true);
  };

  const handleConfirmSize = () => {
    if (selectedSize == null) {
      toast.error("Please select a size");
      return;
    }
    setOpen(false);
    runAdd(String(selectedSize));
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBagClick}
        disabled={disabled || (requireAuth && !authHydrated)}
        className={className}
        aria-label="Add to cart"
      >
        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#2A4537]">Select size</DialogTitle>
            <DialogDescription>
              {product?.title} — choose a size to add this piece to your bag.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-10 min-w-[2.5rem] px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedSize === size
                    ? "border-[#2A4736] bg-[#2A4736] text-white"
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#2A4736] hover:bg-[#1f3628]"
              onClick={handleConfirmSize}
            >
              Add to bag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

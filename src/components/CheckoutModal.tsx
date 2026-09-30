import { useState } from 'react';
import { CartItem, ShippingRegion } from '../types';
import CartDrawer from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedRegion: ShippingRegion;
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  selectedRegion,
  onClearCart
}: CheckoutModalProps) {
  const [region, setRegion] = useState<ShippingRegion>(selectedRegion);

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={onClose}
      items={items}
      onUpdateQuantity={() => {}}
      onRemoveItem={() => {}}
      selectedRegion={region}
      onSelectRegion={setRegion}
      onProceedToCheckout={() => {}}
      onClearCart={onClearCart}
      initialStep="checkout"
    />
  );
}

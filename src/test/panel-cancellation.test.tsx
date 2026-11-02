import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { catalogProducts } from '@/data/catalog';

const product = { ...catalogProducts[0], id: 'panel-test', category: 'vhodnye' as const, price: 20000, oldPrice: undefined };
const panels = [{ id: 11, name: 'Белая панель', image_url: null, price_modifier: 3000, sort_order: 0 }];

function CartProbe() {
  const { items, totalPrice } = useCart();
  return <output data-testid="cart-state">{JSON.stringify({ items, totalPrice })}</output>;
}

function renderConfigurator() {
  render(<MemoryRouter><CartProvider><ProductConfigurator product={product} panelColors={panels} /><CartProbe /></CartProvider></MemoryRouter>);
}

describe('Cancel internal panel selection', () => {
  beforeEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

  it('clicking a selected panel removes its surcharge and can select it again', () => {
    renderConfigurator();
    const panel = screen.getByRole('button', { name: 'Белая панель' });
    fireEvent.click(panel);
    fireEvent.click(panel);
    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));
    const cart = JSON.parse(screen.getByTestId('cart-state').textContent ?? '{}');
    expect(cart.items[0].panelColor.id).toBe(11);
    expect(cart.totalPrice).toBe(23000);
  });

  it('adds the door to the cart without the canceled panel or its surcharge', () => {
    renderConfigurator();
    fireEvent.click(screen.getByRole('button', { name: 'Белая панель' }));
    fireEvent.click(screen.getByRole('button', { name: 'В корзину' }));
    const cart = JSON.parse(screen.getByTestId('cart-state').textContent ?? '{}');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].panelColor).toBeNull();
    expect(cart.totalPrice).toBe(20000);
  });
});
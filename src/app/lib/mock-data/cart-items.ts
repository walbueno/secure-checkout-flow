export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const mockCartItems: CartItem[] = [
  { id: "1", name: "Tênis Runner Pro", price: 349.9, quantity: 1 },
  { id: "2", name: "Meia Esportiva (par)", price: 29.9, quantity: 2 },
];
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();

      const response = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (response) {
        const restoredArray = JSON.parse(response);
        setProducts([...restoredArray]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(prod => prod.id === product.id);

      if (productExist) {
        setProducts(
          products.map(p => {
            const quantity = productExist.quantity + 1;
            return p.id === product.id ? { ...product, quantity } : p;
          }),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );

      // let product = products.find(prod => prod.id === newProduct.id);

      // // Check if product already exist
      // // If true then increase the quantity otherwise initialize with 1
      // if (product) {
      //   const { id } = product;
      //   const index = products.findIndex(prod => prod.id === id);

      //   // Remove a repository at a specific index
      //   products.splice(index, 1);

      //   product.quantity += 1;
      // } else {
      //   product = newProduct as Product;
      //   product.quantity = 1;
      // }

      // products.push(product);

      // await AsyncStorage.setItem(
      //   '@GoMarketplace:cart',
      //   JSON.stringify(products),
      // );

      // setProducts([...products]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );

      // const product = products.find(prod => prod.id === id);
      // if (product) {
      //   const index = products.findIndex(prod => prod.id === id);
      //   product.quantity += 1;
      //   products[index] = product;

      //   await AsyncStorage.setItem(
      //     '@GoMarketplace:cart',
      //     JSON.stringify(products),
      //   );

      //   setProducts([...products]);
      // }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );

      // const product = products.find(prod => prod.id === id);
      // if (product) {
      //   const index = products.findIndex(prod => prod.id === id);
      //   if (product.quantity > 1) {
      //     product.quantity -= 1;
      //     products[index] = product;

      //     await AsyncStorage.setItem(
      //       '@GoMarketplace:cart',
      //       JSON.stringify(products),
      //     );

      //     setProducts([...products]);
      //   }
      // }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

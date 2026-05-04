import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getBrasiliaDate = () => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  });
};

export const useStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      currentDate: getBrasiliaDate(),

      products: [],
      salesToday: [],
      salesLast31Days: [],
      expenses: [],

      targets: {
        daily: 0,
        monthly: 0,
      },

      dailyTargets: {},
      inventory: [],

      checkAndResetDailyData: () =>
        set((state) => {
          const today = getBrasiliaDate();

          if (state.currentDate === today) return state;

          const previousDate = state.currentDate;
          const previousTotal = state.salesToday.reduce(
            (acc, sale) => acc + Number(sale.value || 0),
            0
          );

          const alreadyExists = state.salesLast31Days.some(
            (day) => day.date === previousDate
          );

          const updatedSalesLast31Days =
            previousTotal > 0 && !alreadyExists
              ? [{ date: previousDate, total: previousTotal }, ...state.salesLast31Days].slice(0, 31)
              : state.salesLast31Days;

          return {
            currentDate: today,
            salesToday: [],
            salesLast31Days: updatedSalesLast31Days,
          };
        }),

      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: Date.now(),
              price: Number(product.price || 0),
              quantity: Number(product.quantity || 0),
              minQuantity: Number(product.minQuantity || 0),
            },
          ],
        })),

      updateProduct: (id, updates) =>
  set((state) => ({
    products: state.products.map((p) =>
      p.id === id
        ? {
            ...p,
            ...updates,
            name: updates.name ?? p.name ?? '',
            barcode: updates.barcode ?? p.barcode ?? '',
            price: Number(updates.price ?? p.price ?? 0),
            quantity: Number(updates.quantity ?? p.quantity ?? 0),
            minQuantity: Number(updates.minQuantity ?? p.minQuantity ?? 0),
          }
        : p
    ),
  })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addSale: (sale) =>
        set((state) => {
          const today = getBrasiliaDate();
          const shouldResetDay = state.currentDate !== today;

          const productId = Number(sale.productId);
          const quantitySold = Number(sale.quantity || 1);

          const product = state.products.find((p) => Number(p.id) === productId);

          if (!product) {
            alert('Produto não encontrado.');
            return state;
          }

          if (Number(product.quantity || 0) < quantitySold) {
            alert('Estoque insuficiente para essa venda.');
            return state;
          }

          const previousDate = state.currentDate;
          const previousSalesToday = shouldResetDay ? state.salesToday : [];
          const previousTotal = previousSalesToday.reduce(
            (acc, item) => acc + Number(item.value || 0),
            0
          );

          const alreadyExists = state.salesLast31Days.some(
            (day) => day.date === previousDate
          );

          const updatedSalesLast31Days =
            shouldResetDay && previousTotal > 0 && !alreadyExists
              ? [{ date: previousDate, total: previousTotal }, ...state.salesLast31Days].slice(0, 31)
              : state.salesLast31Days;

          const newSale = {
            ...sale,
            id: Date.now(),
            productId,
            productName: product.name,
            quantity: quantitySold,
            value: Number(sale.value || product.price * quantitySold),
            date: new Date().toISOString(),
            businessDate: today,
          };

          return {
            currentDate: today,
            salesToday: shouldResetDay ? [newSale] : [...state.salesToday, newSale],
            salesLast31Days: updatedSalesLast31Days,

            products: state.products.map((p) =>
              Number(p.id) === productId
                ? { ...p, quantity: Number(p.quantity || 0) - quantitySold }
                : p
            ),

            inventory: [
              ...state.inventory,
              {
                id: Date.now() + 1,
                productId,
                productName: product.name,
                type: 'saida',
                quantity: quantitySold,
                reason: 'Venda realizada',
                date: new Date().toISOString(),
                businessDate: today,
              },
            ],
          };
        }),

        addSaleFromBackend: (sale) =>
          set((state) => {
            const today = getBrasiliaDate();

            const newSale = {
              ...sale,
              id: sale.id || Date.now(),
              productId: Number(sale.productId),
              productName: sale.productName || 'Produto',
              quantity: Number(sale.quantity || 1),
              value: Number(sale.value || 0),
              date: sale.date || new Date().toISOString(),
              businessDate: today,
            };

            return {
              currentDate: today,
              salesToday: [...state.salesToday, newSale],
            };
          }),

        deleteSale: (id) =>
          set((state) => {
            const saleToDelete = state.salesToday.find((s) => s.id === id);

            if (!saleToDelete) return state;

            const productId = Number(saleToDelete.productId);
            const quantity = Number(saleToDelete.quantity || 0);

            return {
              salesToday: state.salesToday.filter((s) => s.id !== id),

              products: state.products.map((p) =>
                Number(p.id) === productId
                  ? {
                      ...p,
                      quantity: Number(p.quantity || 0) + quantity,
                    }
                  : 
                p
              ),

      // registra histórico
      inventory: [
        ...state.inventory,
        {
          id: Date.now(),
          productId,
          productName: saleToDelete.productName,
          type: 'entrada',
          quantity: quantity,
          reason: 'Venda excluída',
          date: new Date().toISOString(),
          businessDate: getBrasiliaDate(),
        },
      ],
    };
  }),


      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              ...expense,
              id: Date.now(),
              value: Number(expense.value || 0),
              date: new Date().toISOString(),
              businessDate: getBrasiliaDate(),
            },
          ],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((exp) =>
            exp.id === id
              ? {
                  ...exp,
                  ...updates,
                  value: Number(updates.value ?? exp.value ?? 0),
                }
              : exp
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        })),

      updateTargets: (daily, monthly) =>
        set({
          targets: {
            daily: Number(daily) || 0,
            monthly: Number(monthly) || 0,
          },
        }),

      setDailyTargetByDate: (date, value) =>
        set((state) => ({
          dailyTargets: {
            ...state.dailyTargets,
            [date]: Number(value) || 0,
          },
        })),

      deleteDailyTargetByDate: (date) =>
        set((state) => {
          const updatedDailyTargets = { ...state.dailyTargets };
          delete updatedDailyTargets[date];

          return {
            dailyTargets: updatedDailyTargets,
          };
        }),

      getDailyTargetByDate: (date) => {
        const state = get();
        return state.dailyTargets?.[date] || state.targets.daily || 0;
      },

      addInventoryMovement: (movement) =>
        set((state) => ({
          inventory: [
            ...state.inventory,
            {
              ...movement,
              id: Date.now(),
              date: new Date().toISOString(),
              businessDate: getBrasiliaDate(),
            },
          ],
        })),

      getTotalRevenue: () => {
        const state = get();
        const today = getBrasiliaDate();

        return state.salesToday
          .filter((sale) => (sale.businessDate || sale.date?.split('T')[0]) === today)
          .reduce((acc, sale) => acc + Number(sale.value || 0), 0);
      },

      getTotalExpenses: () => {
        const state = get();

        return state.expenses.reduce(
          (acc, exp) => acc + Number(exp.value || 0),
          0
        );
      },

      getNetProfit: () => {
        const state = get();
        return state.getTotalRevenue() - state.getTotalExpenses();
      },

      getLowStockProducts: () => {
        const state = get();

        return state.products.filter(
          (p) => Number(p.quantity || 0) <= Number(p.minQuantity || 0)
        );
      },

      getMostSoldProducts: () => {
        const state = get();
        const today = getBrasiliaDate();
        const productSales = {};

        state.salesToday
          .filter((sale) => (sale.businessDate || sale.date?.split('T')[0]) === today)
          .forEach((sale) => {
            productSales[sale.productId] =
              (productSales[sale.productId] || 0) + Number(sale.quantity || 0);
          });

        return Object.entries(productSales)
          .map(([id, qty]) => {
            const product = state.products.find((p) => p.id === Number(id));

            if (!product) return null;

            return {
              ...product,
              sold: qty,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 5);
      },

      getAverageTicket: () => {
        const state = get();
        const today = getBrasiliaDate();

        const todaySales = state.salesToday.filter(
          (sale) => (sale.businessDate || sale.date?.split('T')[0]) === today
        );

        if (todaySales.length === 0) return 0;

        return state.getTotalRevenue() / todaySales.length;
      },

      getTotalStock: () => {
        const state = get();

        return state.products.reduce(
          (acc, p) => acc + Number(p.quantity || 0),
          0
        );
      },
    }),
    {
      name: 'loja-dashboard-storage',

      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        currentDate: state.currentDate,
        products: state.products,
        salesToday: state.salesToday,
        salesLast31Days: state.salesLast31Days,
        expenses: state.expenses,
        targets: state.targets,
        dailyTargets: state.dailyTargets,
        inventory: state.inventory,
      }),

      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        isDarkMode: false,
      }),
    }
  )
);
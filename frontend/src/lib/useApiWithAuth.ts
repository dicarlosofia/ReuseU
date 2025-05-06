import { useGlobalContext } from '@/Context/GlobalContext';
import { listingsApi } from '@/pages/api/listings';
import { reviewsApi } from '@/pages/api/reviews';
import { chatsApi } from '@/pages/api/chats';
import { transactionsApi } from '@/pages/api/transactions';

export const useApiWithAuth = () => {
  const { user } = useGlobalContext();

  const wrapApi = (api: any) => {
    const wrappedApi: any = {};
    for (const [key, value] of Object.entries(api)) {
      if (typeof value === 'function') {
        wrappedApi[key] = async (...args: any[]) => {
          const originalFn = value as Function;
          // Get the Firebase ID token for the current user
          const token = user ? await user.getIdToken() : undefined;
          return originalFn(...args, token);
        };
      } else {
        wrappedApi[key] = value;
      }
    }
    return wrappedApi;
  };

  return {
    listings: wrapApi(listingsApi),
    reviews: wrapApi(reviewsApi),
    chats: wrapApi(chatsApi),
    transactions: wrapApi(transactionsApi),
  };
}; 
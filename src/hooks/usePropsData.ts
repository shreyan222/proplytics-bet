
import { useGetProps } from '@/hooks/useGetProps';

export const usePropsData = () => {
  return useGetProps(['props'], { table: 'props' });
};

// Room Type
export type Room = {
  id?: string;
  number: number;
  type: string;
  status: string;
  price: number;
  cover_image: string | File | undefined;
  other_images?: (string | File)[] | undefined;
};

// Response Wrappers
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ListResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

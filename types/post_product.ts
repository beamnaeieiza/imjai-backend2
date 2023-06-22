export type PostProductDto = {
  reserve_id: number;
  product_name: string;
  product_picture: string;
  product_description: string;
  product_time: string;
  category_id: number;
  locate_latitude: string;
  locate_longtitude: string;
  status: number;
  reserved_yet: boolean;
};

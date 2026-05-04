import { Coupon } from "./Coupon";
import { Product } from "./Product";

export interface Cart{
    total_price:number,
    products:Product[],
    restaurant_id_selected:number,
    coupon_selected?:Coupon,
    home_delivery:boolean,
    address:any
}
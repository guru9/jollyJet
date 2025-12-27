/**
 * Data Transfer Object for toggling product wishlist status
 *
 * @interface ToggleWishlistDTO
 * @property {boolean} isInWishlist - Whether the product should be in the wishlist (true) or not (false)
 */
export interface ToggleWishlistDTO {
  isInWishlist: boolean;
}

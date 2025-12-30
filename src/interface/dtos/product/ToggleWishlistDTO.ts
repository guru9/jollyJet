/**
 * Data Transfer Object for toggling product wishlist status
 *
 * @interface ToggleWishlistDTO
 * @property {boolean} isWishlistStatus - Whether the product should be in the wishlist (true) or not (false)
 */
export interface ToggleWishlistDTO {
  isWishlistStatus: boolean;
}

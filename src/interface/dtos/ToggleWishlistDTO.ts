/**
 * DTO for toggling product wishlist status
 * Contains the boolean flag indicating the desired wishlist state
 */
export interface ToggleWishlistDTO {
  /** Whether the product should be in the wishlist (true) or not (false) */
  isInWishlist: boolean;
}

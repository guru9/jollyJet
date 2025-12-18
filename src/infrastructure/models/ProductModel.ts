import mongoose, { Document, Schema } from 'mongoose';

export interface IProductDocument extends Document {
  name: string; // Name of the product (required, indexed)
  description: string; // Description of the product (required, full-text search)
  price: number; // Price of the product (required, min: 0)
  stock: number; // Available stock quantity (required, min: 0)
  category: string; // Category to which the product belongs (required, indexed)
  images: string[]; // Array of image URLs (optional, default: empty array)
  isActive: boolean; // Current status of the product (default: true)
  createdAt: Date; // Timestamp of product creation (default: now)
  updatedAt: Date; // Timestamp of last update (default: now)
  wishlistCount: number; // Number of times the product has been added to wishlists (default: 0)
  isInWishlist: boolean; // Indicates if the product is in the user's wishlist (default: false)
}

// Mongoose schema definition for Product
const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true }, //Requiredcfield with text indexing
  description: { type: String, required: true, index: 'text' }, // Required field with full-text search indexing
  price: { type: Number, required: true, min: 0 }, // Required field with minimum value of 0
  stock: { type: Number, required: true, min: 0 }, // Required field with minimum value of 0
  category: { type: String, required: true, index: true }, // Required fieldF with indexing
  images: { type: [String], default: [] }, // Optional field with default empty array
  isActive: { type: Boolean, default: true }, // Default value true
  createdAt: { type: Date, default: Date.now }, // Default to current date/time
  updatedAt: { type: Date, default: Date.now }, // Default to current date/time
  wishlistCount: { type: Number, default: 0, min: 0 }, // Default value 0 with minimum value of 0
  isInWishlist: { type: Boolean, default: false }, // Default value false
});

//create and export ProductModel
export const Productmodel = mongoose.model<IProductDocument>('Product', ProductSchema);

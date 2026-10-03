import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  contract: { type: String, required: true },
  tokenId: { type: String, required: true },
  image: String,
  name: String,
  price: String,
  createdAt: { type: Date, default: Date.now }
});

CartItemSchema.index({ walletAddress: 1, contract: 1, tokenId: 1 }, { unique: true });

export default mongoose.model('CartItem', CartItemSchema);

import express from 'express';
import CartItem from '../models/CartItem.js';

const router = express.Router();

// Add to cart
router.post('/', async (req, res) => {
  const { walletAddress, contract, tokenId, image, name, price } = req.body;

  try {
    const newItem = await CartItem.findOneAndUpdate(
      { walletAddress, contract, tokenId },
      { walletAddress, contract, tokenId, image, name, price },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Check if in cart
router.get('/check/:wallet/:contract/:tokenId', async (req, res) => {
  const { wallet, contract, tokenId } = req.params;

  try {
    const item = await CartItem.findOne({ walletAddress: wallet, contract, tokenId });
    res.json({ inCart: !!item });
  } catch {
    res.status(500).json({ error: 'Check failed' });
  }
});

export default router;

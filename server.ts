import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth';
import {
  getUserProducts,
  saveUserProduct,
  deleteUserProduct,
  updateUserProductVolume,
} from './src/db/products';

const app = express();

app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'cloudsql-postgres',
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node',
  });
});

app.get('/api/auth/me', optionalAuth, (req: AuthRequest, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email?.split('@')[0],
        picture: req.user.picture,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Get products for logged in user
app.get('/api/products', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const productsList = await getUserProducts(req.user.uid);
    res.json(productsList);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch saved products from database' });
  }
});

// Save or update product
app.post('/api/products', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const productData = req.body;
    if (!productData || !productData.name || productData.hpp === undefined) {
      return res.status(400).json({ error: 'Invalid product data' });
    }

    const saved = await saveUserProduct(
      req.user.uid,
      req.user.email || 'user@example.com',
      productData
    );
    res.json(saved);
  } catch (error: any) {
    console.error('Error saving product:', error);
    res.status(500).json({ error: 'Failed to save product to database' });
  }
});

// Delete product
app.delete('/api/products/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    await deleteUserProduct(req.user.uid, id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product from database' });
  }
});

// Update volume
app.patch('/api/products/:id/volume', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { volume } = req.body;
    if (typeof volume !== 'number') {
      return res.status(400).json({ error: 'Volume must be a number' });
    }
    await updateUserProductVolume(req.user.uid, id, volume);
    res.json({ success: true, id, volume });
  } catch (error: any) {
    console.error('Error updating volume:', error);
    res.status(500).json({ error: 'Failed to update volume in database' });
  }
});

// Standalone server initialization (when not running on Vercel)
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;


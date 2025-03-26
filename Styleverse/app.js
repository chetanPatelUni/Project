require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes, Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// ================== DATABASE CONNECTION ==================
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// ================== MODEL DEFINITIONS (PROPER ORDER) ==================
const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: DataTypes.STRING(50),
  last_name: DataTypes.STRING(50),
  date_joined: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  role: {
    type: DataTypes.ENUM('Customer', 'Designer', 'Admin'),
    allowNull: false
  }
}, { tableName: 'users', timestamps: false });

const Merchant = sequelize.define('Merchant', {
  merchant_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bio: DataTypes.TEXT,
  specialty: DataTypes.STRING(100),
  portfolio: DataTypes.JSONB,
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  }
}, { tableName: 'merchants', timestamps: false });

const CustomizationRequest = sequelize.define('CustomizationRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fabric_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  size: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Completed'),
    defaultValue: 'Pending'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'customization_requests', timestamps: false });

const DesignerProposal = sequelize.define('DesignerProposal', {
  proposal_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Cancelled'),
    defaultValue: 'Pending'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'designer_proposals', timestamps: false });

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  review_text: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'reviews', timestamps: false });

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Shipped', 'Completed'),
    defaultValue: 'Pending'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'orders', timestamps: false });

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: DataTypes.STRING(50),
  payment_type: {
    type: DataTypes.ENUM('Customer Payment', 'Merchant Payout'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    defaultValue: 'Pending'
  },
  transaction_id: DataTypes.STRING(100),
  transaction_date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'payments', timestamps: false });

const Chat = sequelize.define('Chat', {
  chat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Sent'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'chat', timestamps: false });

const Notification = sequelize.define('Notification', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: DataTypes.ENUM('OrderUpdate', 'Message', 'Promotion'),
  message: DataTypes.TEXT,
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { tableName: 'notifications', timestamps: false });

const Wishlist = sequelize.define('Wishlist', {
  wishlist_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: DataTypes.INTEGER,
  saved_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, { tableName: 'wishlist', timestamps: false });

const BlogPost = sequelize.define('BlogPost', {
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING(255),
  content: DataTypes.TEXT,
  category: DataTypes.STRING(50),
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, { tableName: 'blog_posts', timestamps: false });

// ================== RELATIONSHIPS (DEFINED AFTER ALL MODELS) ==================
User.hasMany(CustomizationRequest, { foreignKey: 'user_id' });
CustomizationRequest.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Chat, { foreignKey: 'sender_id' });
User.hasMany(Chat, { foreignKey: 'receiver_id' });
Chat.belongsTo(User, { foreignKey: 'sender_id' });
Chat.belongsTo(User, { foreignKey: 'receiver_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Wishlist, { foreignKey: 'user_id' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BlogPost, { foreignKey: 'author_id' });
BlogPost.belongsTo(User, { foreignKey: 'author_id' });

Merchant.belongsTo(User, { foreignKey: 'user_id' });
Merchant.hasMany(DesignerProposal, { foreignKey: 'merchant_id' });
Merchant.hasMany(Review, { foreignKey: 'merchant_id' });
Review.belongsTo(Merchant, { foreignKey: 'merchant_id' });

CustomizationRequest.hasMany(DesignerProposal, { foreignKey: 'request_id' });
DesignerProposal.belongsTo(CustomizationRequest, { foreignKey: 'request_id' });
DesignerProposal.belongsTo(Merchant, { foreignKey: 'merchant_id' });

Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(Merchant, { foreignKey: 'merchant_id' });

// ================== AUTHENTICATION MIDDLEWARE ==================
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      if (!user) throw new Error('User not found');
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
  
// ================== ROUTES ==================
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, userId: user.user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Request (Customer only)
app.post('/requests', authenticate, async (req, res) => {
    try {
      // Verify user role
      if (req.user.role !== 'Customer') {
        return res.status(403).json({ error: 'Only customers can create requests' });
      }
  
      // Validate input
      const { fabric_type, size, style } = req.body;
      if (!fabric_type || !size) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Create request
      const newRequest = await CustomizationRequest.create({
        user_id: req.user.user_id,
        fabric_type,
        size,
        style: style || null,
        status: 'Pending'
      });
  
      res.status(201).json({
        message: 'Request created successfully',
        request: {
          id: newRequest.request_id,
          fabric_type: newRequest.fabric_type,
          size: newRequest.size,
          status: newRequest.status,
          created_at: newRequest.created_at
        }
      });
  
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get User's Requests
  app.get('/requests', authenticate, async (req, res) => {
    try {
      const requests = await CustomizationRequest.findAll({
        where: { user_id: req.user.user_id },
        attributes: ['request_id', 'fabric_type', 'size', 'status', 'created_at']
      });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });
  
  // Update Request Status (Admin/Designer)
  app.put('/requests/:id', authenticate, async (req, res) => {
    try {
      // Authorization check
      if (!['Admin', 'Designer'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      const request = await CustomizationRequest.findByPk(req.params.id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
  
      await request.update({ status: req.body.status });
      res.json({ message: 'Request updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update request' });
    }
  });
  
  // Delete Request
  app.delete('/requests/:id', authenticate, async (req, res) => {
    try {
      const request = await CustomizationRequest.findByPk(req.params.id);
      
      // Authorization: Only owner or admin can delete
      if (request.user_id !== req.user.user_id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      await request.destroy();
      res.json({ message: 'Request deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete request' });
    }
  });
// ================== SERVER INITIALIZATION ==================
sequelize.authenticate()
  .then(() => sequelize.sync({ force: false }))
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Database connected: ${process.env.DB_URL}`);
    });
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
  // ================== DESIGNER ROUTES ==================
// Get all designers
app.get('/designers', authenticate, async (req, res) => {
    try {
      const designers = await Merchant.findAll({
        include: [{
          model: User,
          attributes: ['first_name', 'last_name', 'email']
        }],
        attributes: ['merchant_id', 'bio', 'specialty', 'portfolio', 'rating']
      });
      res.json(designers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch designers' });
    }
  });
  
  // ================== PROPOSAL ROUTES ==================
  app.post('/proposals', authenticate, async (req, res) => {
    try {
      // Authorization check
      if (req.user.role !== 'Designer') {
        return res.status(403).json({ error: 'Only designers can create proposals' });
      }
  
      // Validation
      const { request_id, price } = req.body;
      if (!request_id || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Create proposal
      const proposal = await DesignerProposal.create({
        request_id,
        merchant_id: req.user.merchant_id,
        price,
        status: 'Pending'
      });
  
      res.status(201).json({
        message: 'Proposal created successfully',
        proposal: {
          proposal_id: proposal.proposal_id,
          price: proposal.price,
          status: proposal.status
        }
      });
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to create proposal' });
    }
  });
  
  // ================== WISHLIST ROUTES ==================
  app.post('/wishlist', authenticate, async (req, res) => {
    try {
      // Authorization check
      if (req.user.role !== 'Customer') {
        return res.status(403).json({ error: 'Only customers can use wishlist' });
      }
  
      // Validation
      const { product_id } = req.body;
      if (!product_id) {
        return res.status(400).json({ error: 'Missing product_id' });
      }
  
      // Add to wishlist
      const wishlistItem = await Wishlist.create({
        user_id: req.user.user_id,
        product_id
      });
  
      res.status(201).json({
        message: 'Added to wishlist',
        item: {
          wishlist_id: wishlistItem.wishlist_id,
          product_id: wishlistItem.product_id
        }
      });
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  });
  
  // ================== BLOG ROUTES ==================
  app.post('/blog', authenticate, async (req, res) => {
    try {
      // Authorization check
      if (req.user.role !== 'Designer') {
        return res.status(403).json({ error: 'Only designers can create blog posts' });
      }
  
      // Validation
      const { title, content, category } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Create blog post
      const post = await BlogPost.create({
        title,
        content,
        category,
        author_id: req.user.user_id
      });
  
      res.status(201).json({
        message: 'Blog post created',
        post: {
          post_id: post.post_id,
          title: post.title,
          category: post.category
        }
      });
  
    } catch (error) {
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });
  
  // ================== NOTIFICATION ROUTES ==================
  app.get('/notifications/:userId', authenticate, async (req, res) => {
    try {
      // Authorization check
      if (req.user.user_id !== parseInt(req.params.userId)) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
  
      const notifications = await Notification.findAll({
        where: { user_id: req.params.userId },
        order: [['created_at', 'DESC']]
      });
  
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

// ================== ERROR HANDLING ==================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});